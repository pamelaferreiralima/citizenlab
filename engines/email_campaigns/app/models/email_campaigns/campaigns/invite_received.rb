module EmailCampaigns
  class Campaigns::InviteReceived < Campaign
    include ActivityTriggerable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages except: ['churned']

    recipient_filter :filter_recipient


    def activity_triggers
      {'Invite' => {'created' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.invitee.id)
    end

    def generate_commands recipient:, activity:
      [{
        event_payload: {
          inviter_first_name: activity.item.inviter.first_name,
          inviter_last_name: activity.item.inviter.last_name,
          invitee_first_name: activity.item.invitee.first_name,
          invitee_last_name: activity.item.invitee.last_name,
          invite_text: activity.item.invite_text,
          activate_invite_url: Frontend::UrlService.new.invite_url(object.token, locale: object.invitee.locale)
        }
      }]
    end
  end
end