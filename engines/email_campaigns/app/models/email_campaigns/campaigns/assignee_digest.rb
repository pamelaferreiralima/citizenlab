module EmailCampaigns
  class Campaigns::AssigneeDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_moderators_only

    N_TOP_IDEAS = ENV.fetch("N_ASSIGNEE_WEEKLY_REPORT_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:tuesday).hour_of_day(8)
        )
      end
    end

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def generate_commands recipient:, time: nil
      @assigned_ideas = recipient.assigned_ideas
        .feedback_needed
        .where('published_at > ?', (time - 1.week))
        .order(published_at: :desc)
        .take(N_TOP_IDEAS)
      assigned = assigned_initiatives(recipient: recipient, time: time)
      succesful = succesful_assigned_initiatives(recipient: recipient, time: time)
      initiative_ids = (assigned + succesful).map do |d|
        d[:id]
      end.compact
      if @assigned_ideas.present?
        [{
          event_payload: {
            assigned_ideas: @assigned_ideas.map{ |idea|
              {
                id: idea.id,
                title_multiloc: idea.title_multiloc,
                url: Frontend::UrlService.new.model_to_url(idea),
                published_at: idea.published_at.iso8601,
                author_name: idea.author_name,
                upvotes_count: idea.upvotes_count,
                downvotes_count: idea.downvotes_count,
                comments_count: idea.comments_count,
              }
            },
            need_feedback_assigned_ideas_count: StatIdeaPolicy::Scope.new(recipient, Idea.published).resolve.where(assignee: recipient).feedback_needed.count,
            assigned_initiatives: assigned,
            succesful_assigned_initiatives: succesful
          },
          tracked_content: {
            idea_ids: @assigned_ideas.map{|i| i.id},
            initiative_ids: initiative_ids
          }
        }]
      else 
        []
      end
    end


    private

    def user_filter_admins_moderators_only users_scope, options={}
      users_scope.admin.or(users_scope.project_moderator)
    end

    def assigned_initiatives recipient:, time:
      recipient.assigned_initiatives.published
        .where('published_at > ?', time - 1.week)
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: initiative.author_name,
          upvotes_count: initiative.upvotes_count,
          upvotes_increment: activity_counts.dig(initiative.id, :upvotes),
          comments_count: initiative.comments_count,
          comments_increment: activity_counts.dig(initiative.id, :comments)
        }
      end
    end

    def succesful_assigned_initiatives recipient:, time:
      recipient.assigned_initiatives
        .left_outer_joins(:initiative_status_changes)
        .where(
          'initiative_status_changes.initiative_status_id = ? AND initiative_status_changes.created_at > ?', 
          InitiativeStatus.where(code: 'threshold_reached').ids.first, 
          (time - 1.week)
          )
        .feedback_needed
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: initiative.author_name,
          upvotes_count: initiative.upvotes_count,
          upvotes_increment: activity_counts.dig(initiative.id, :upvotes),
          comments_count: initiative.comments_count,
          comments_increment: activity_counts.dig(initiative.id, :comments),
          threshold_reached_at: initiative.initiative_status_changes.order(:created_at).pluck(:created_at).last
        }
      end
    end

  end
end