# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_registrations
#
#  id                             :uuid             primary key
#  dimension_user_id              :uuid
#  dimension_date_registration_id :date
#
module Analytics
  class FactRegistration < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: false
    belongs_to :dimension_date_registration, class_name: 'Analytics::DimensionDate', primary_key: 'date'

    validates :dimension_user, presence: true
    validates :dimension_date_registration, presence: true
  end
end
