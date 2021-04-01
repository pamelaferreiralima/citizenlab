require 'rails_helper'


describe "seedfile", slow_test: true do
  it "generates a valid tenant and user" do
    AppConfiguration.first.destroy!

    load Rails.root.join("db","seeds.rb")
    expect(AppConfiguration.count).to be(1)
      
    expect(User.admin.count).to be > 0
    expect(Page.count).to be 6 # 0 generated + 5 legal pages + 1 initiatives + 0 success stories
    expect(IdeaStatus.count).to be > 0
    expect(InitiativeStatus.count).to be > 0
    expect(Topic.count).to be > 0
    expect(Project.count).to be > 0
    expect(ProjectImage.count).to be > 0
    expect(ProjectsTopic.count).to be > 0

    expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
    expect(EmailCampaigns::Campaign.count).to be > 0
  end

end
