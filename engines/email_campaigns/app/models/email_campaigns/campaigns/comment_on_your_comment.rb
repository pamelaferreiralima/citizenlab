module EmailCampaigns
  class Campaigns::CommentOnYourComment < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::CommentOnYourComment' => {'created' => true}}
    end
  end
end