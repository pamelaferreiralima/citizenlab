# frozen_string_literal: true

class InputJsonSchemaGeneratorService < JsonSchemaGeneratorService
  # Code comes from back/app/services/concerns/json_forms_ideas_overrides.rb

  def visit_text_multiloc(field)
    return super unless field.code == 'title_multiloc'

    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string',
          minLength: 10,
          maxLength: 80
        }
      end
    }
  end

  def visit_html_multiloc(field)
    return super unless field.code == 'body_multiloc'

    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string',
          minLength: 40
        }
      end
    }
  end

  def visit_multiselect(field)
    return super unless field.code == 'topic_ids'

    # TODO: can `project` be nil?
    topics = field.resource.project&.allowed_input_topics
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }.tap do |items|
        unless topics.empty?
          items[:oneOf] = topics.map do |topic|
            {
              const: topic.id,
              title: title_for(topic, current_locale)
            }
          end
        end
      end
    }
  end
end
