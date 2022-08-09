# frozen_string_literal: true

module IdeaCustomFields
  class UpdateAllFailedError < StandardError
    def initialize(errors)
      super()
      @errors = errors
    end
    attr_reader :errors
  end

  class WebApi::V1::Admin::IdeaCustomFieldsController < ApplicationController
    before_action :verify_feature_flag
    before_action :set_custom_field, only: %i[show update]
    before_action :set_custom_form, only: %i[index update_all]
    skip_after_action :verify_policy_scoped

    def index
      authorize CustomField.new(resource: @custom_form), :index?, policy_class: IdeaCustomFieldPolicy
      fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
      render json: ::WebApi::V1::CustomFieldSerializer.new(fields, params: fastjson_params).serialized_json
    end

    def show
      render json: ::WebApi::V1::CustomFieldSerializer.new(@custom_field, params: fastjson_params).serialized_json
    end

    # `update` by ID is not possible for default custom fields that have not been persisted yet,
    # because default fields have a randomly generated ID. `upsert_by_code` should be used for
    # default fields.
    def update
      update_field do |custom_form|
        IdeaCustomFieldsService.new(custom_form).find_field_by_id(params[:id])
      end
    end

    def update_all
      authorize CustomField.new(resource: @custom_form), :update_all?, policy_class: IdeaCustomFieldPolicy
      update_fields
      @custom_form.reload
      render json: ::WebApi::V1::CustomFieldSerializer.new(
        IdeaCustomFieldsService.new(@custom_form).configurable_fields,
        params: fastjson_params
      ).serialized_json
    rescue UpdateAllFailedError => e
      render json: { errors: e.errors }, status: :unprocessable_entity
    end

    # `upsert_by_code` cannot be used for extra fields, because they do not have a code.
    # `update` should be used for extra fields.
    def upsert_by_code
      update_field do |custom_form|
        IdeaCustomFieldsService.new(custom_form).find_or_build_field(params[:code])
      end
    end

    private

    def update_fields
      errors = {}
      fields = IdeaCustomFieldsService.new(@custom_form).configurable_fields
      field_index = fields.index_by(&:id)
      given_ids = update_all_params.pluck(:id)

      ActiveRecord::Base.transaction do
        deleted_fields = fields.reject { |field| given_ids.include? field.id }
        deleted_fields.each do |field|
          SideFxCustomFieldService.new.before_destroy(field, current_user)
          unless field.destroy
            errors[field.key] = field.errors.details
            next
          end
          SideFxCustomFieldService.new.after_destroy(field, current_user)
        end
        update_all_params.each do |field_params|
          if field_params[:id]
            field = field_index[field_params[:id]]
            field.assign_attributes field_params
            SideFxCustomFieldService.new.before_update(field, current_user)
            unless field.save
              errors[field.key] = field.errors.details
              next
            end
            SideFxCustomFieldService.new.after_update(field, current_user)
          else
            field = CustomField.new field_params.merge(resource: @custom_form)
            SideFxCustomFieldService.new.before_create(field, current_user)
            unless field.save
              errors[field.key] = field.errors.details
              next
            end
            SideFxCustomFieldService.new.after_create(field, current_user)
          end
          field.move_to_bottom
        end
        raise UpdateAllFailedError, errors if errors.present?
      end
    end

    def update_field(&_block)
      # Wrapping this in a transaction, to avoid the race condition where
      # simultaneous requests, when custom_form does not exist yet, make
      # multiple custom_forms and the last form gets associated to the project
      custom_field = ActiveRecord::Base.transaction do
        # Row-level locking of the project record
        # See https://www.2ndquadrant.com/en/blog/postgresql-anti-patterns-read-modify-write-cycles/
        project = Project.lock.find(params[:project_id])
        custom_form = CustomForm.find_or_initialize_by(project: project)
        custom_form.save! unless custom_form.persisted?

        (yield custom_form).tap do |field|
          assign_attributes_to(field)
        end
      end

      authorize custom_field, policy_class: IdeaCustomFieldPolicy
      already_existed = custom_field.persisted?

      if custom_field.save
        if already_existed
          SideFxCustomFieldService.new.after_update(custom_field, current_user)
        else
          SideFxCustomFieldService.new.after_create(custom_field, current_user)
        end
        render json: ::WebApi::V1::CustomFieldSerializer.new(
          custom_field.reload,
          params: fastjson_params
        ).serialized_json, status: :ok
      else
        render json: { errors: custom_field.errors.details }, status: :unprocessable_entity
      end
    end

    def assign_attributes_to(custom_field)
      field_params = params
        .require(:custom_field)
        .permit(IdeaCustomFieldPolicy.new(current_user, custom_field).permitted_attributes)
      custom_field.assign_attributes field_params
    end

    def update_all_params
      params
        .require(:custom_fields)
        .map do |field|
          field.permit(
            :id,
            :input_type,
            :required,
            :enabled,
            { title_multiloc: CL2_SUPPORTED_LOCALES,
              description_multiloc: CL2_SUPPORTED_LOCALES }
          )
        end
    end

    def set_custom_form
      @project = Project.find(params[:project_id])
      @custom_form = CustomForm.find_or_initialize_by(project: @project)
    end

    def set_custom_field
      @custom_field = CustomField.find(params[:id])
      authorize @custom_field, policy_class: IdeaCustomFieldPolicy
    end

    def verify_feature_flag
      return if AppConfiguration.instance.feature_activated? 'idea_custom_fields'

      render json: { errors: { base: [{ error: '"idea_custom_fields" feature is not activated' }] } }, status: :unauthorized
    end
  end
end
