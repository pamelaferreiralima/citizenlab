require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year"
end

resource "Stats - Users" do

  explanation "The various stats endpoints can be used to show how certain properties of users."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')

    # we need the built in custom fields first, so lets run the base tenant template
    TenantTemplateService.new.apply_template('base')
    CustomField.find_by(code: 'education').update(enabled: true)
    travel_to(Time.now.in_time_zone(@timezone).beginning_of_month - 1.days) do
      create(:user)
    end
    
    travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 10.days) do
      create(:user, gender: nil)
      create(:user, gender: 'male')
      create(:admin, gender: 'female')
      create(:user, gender: 'unspecified')
      create(:invited_user)
    end
    travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 25.days) do
      create_list(:user_with_demographics, 4, roles: [type: 'admin'])
    end
  end

  get "web_api/v1/stats/users_count" do
    time_boundary_parameters self

    example_request "Count all users" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq User.active.count
    end
  end

  get "web_api/v1/stats/users_by_time" do
    time_series_parameters self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
    let(:interval) { 'day' }
    let(:project) { create(:private_admins_project).id }

    example_request "Users by time" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_month.day
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.inject(&:+)).to eq 6
    end

  end

  get "web_api/v1/stats/users_by_time_cumulative" do
    time_series_parameters self
    parameter :project, "Project ID. Only return users that can access the given project.", required: false

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
    let(:interval) { 'day' }
    let(:project) { create(:private_admins_project).id }

    example_request "Users by time (cumulative)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_month.day
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      # monotonically increasing
      expect(json_response.values.uniq).to eq json_response.values.uniq.sort
      expect(json_response.values.last).to eq 6
    end
  end

  get "web_api/v1/stats/active_users_by_time" do
    explanation "Active users are that have generated some activity within the given interval window"
    time_series_parameters self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 3.days) do
        user = create(:user)
        create_list(:activity, 2, user: user)
        create(:activity)
      end
      travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 8.days) do
        create_list(:activity, 2)
      end
    end

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
    let(:interval) { 'day' }

    example_request "Active users by time" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_month.day
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.inject(&:+)).to eq 4
    end
  end

  get "web_api/v1/stats/users_by_gender" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

    example_request "Users by gender" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.stringify_keys.keys.uniq).to match_array ['male','female','unspecified','_blank']
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/users_by_birthyear" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }

    example_request "Users by birthyear" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/users_by_domicile" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }

    example_request "Users by domicile" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/users_by_education" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

    example_request "Users by education" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      allowed_keys = ['0','1','2','3','4','5','6','7','8','_blank']
      expect(json_response.stringify_keys.keys.uniq - allowed_keys).to be_empty
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
    end
  end
end