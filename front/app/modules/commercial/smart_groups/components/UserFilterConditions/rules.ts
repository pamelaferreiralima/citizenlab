import TextValueSelector from './ValueSelector/TextValueSelector';
import DateValueSelector from './ValueSelector/DateValueSelector';
import AreaValueSelector from './ValueSelector/AreaValueSelector';
import AreaValuesSelector from './ValueSelector/AreaValuesSelector';
import ProjectValueSelector from './ValueSelector/ProjectValueSelector';
import ProjectValuesSelector from './ValueSelector/ProjectValuesSelector';
import NumberValueSelector from './ValueSelector/NumberValueSelector';

import CustomFieldOptionValueSelector from 'modules/commercial/user_custom_fields/admin/components/CustomFieldOptionValueSelector';
import CustomFieldOptionValuesSelector from 'modules/commercial/user_custom_fields/admin/components/CustomFieldOptionValuesSelector';

import TopicValueSelector from './ValueSelector/TopicValueSelector';
import TopicValuesSelector from './ValueSelector/TopicValuesSelector';
import IdeaStatusValueSelector from './ValueSelector/IdeaStatusValueSelector';
import IdeaStatusValuesSelector from './ValueSelector/IdeaStatusValuesSelector';

/**
  The TRule type below was generated by json-schema-to-typescript:
  https://github.com/bcherny/json-schema-to-typescript

  The JSON schema can be found in the groups API docs
  => Create a group with 'rules' membership_type

  At the time of this commit, the url is:
  http://developers.citizenlab.co/api-docs/frontweb_api/master/groups/create_a_group_with_%27rules%27_membership_type.html
 */

/**
 * Schema for validating the rules used in smart groups
 */

export type TRuleType = TStaticRuleType | TCustomRuleType;

export type TStaticRuleType =
  | 'email'
  | 'lives_in'
  | 'registration_completed_at'
  | 'role'
  | 'participated_in_project'
  | 'participated_in_topic'
  | 'participated_in_idea_status'
  | 'verified';

export type TCustomRuleType =
  | 'custom_field_text'
  | 'custom_field_select'
  | 'custom_field_checkbox'
  | 'custom_field_date'
  | 'custom_field_number';

export type TPredicate = TStaticPredicate | TCustomPredicate;

type TStaticPredicate =
  | TRolePredicate
  | TEmailPredicate
  | TResidencePredicate
  | TRegistrationCompletedPredicate
  | TParticipatedInProjectPredicate
  | TParticipatedInTopicPredicate
  | TParticipatedInStatusPredicate
  | TVerifiedPredicate;

type TRolePredicate =
  | 'is_admin'
  | 'not_is_admin'
  | 'is_project_moderator'
  | 'not_is_project_moderator'
  | 'is_normal_user'
  | 'not_is_normal_user';

type TEmailPredicate =
  | 'is'
  | 'not_is'
  | 'contains'
  | 'not_contains'
  | 'begins_with'
  | 'not_begins_with'
  | 'ends_on'
  | 'not_ends_on';

type TResidencePredicate =
  | 'has_value'
  | 'not_has_value'
  | 'is_empty'
  | 'not_is_empty'
  | 'is_one_of'
  | 'not_is_one_of';

type TRegistrationCompletedPredicate =
  | 'is_empty'
  | 'not_is_empty'
  | 'is_before'
  | 'is_exactly'
  | 'is_after';

type TParticipatedInProjectPredicate =
  | 'in'
  | 'not_in'
  | 'posted_in'
  | 'not_posted_in'
  | 'commented_in'
  | 'not_commented_in'
  | 'voted_idea_in'
  | 'not_voted_idea_in'
  | 'voted_comment_in'
  | 'not_voted_comment_in'
  | 'budgeted_in'
  | 'not_budgeted_in'
  | 'volunteered_in'
  | 'not_volunteered_in';

type TParticipatedInTopicPredicate =
  | 'in'
  | 'not_in'
  | 'posted_in'
  | 'not_posted_in'
  | 'commented_in'
  | 'not_commented_in'
  | 'voted_idea_in'
  | 'not_voted_idea_in'
  | 'voted_comment_in'
  | 'not_voted_comment_in';

type TParticipatedInStatusPredicate =
  | 'in'
  | 'not_in'
  | 'posted_in'
  | 'not_posted_in'
  | 'commented_in'
  | 'not_commented_in'
  | 'voted_idea_in'
  | 'not_voted_idea_in'
  | 'voted_comment_in'
  | 'not_voted_comment_in';

type TVerifiedPredicate = 'is_verified' | 'not_is_verified';

type TCustomPredicate =
  | TCustomFieldSelectPredicate
  | TCustomFieldCheckboxPredicate
  | TCustomFieldDatePredicate
  | TCustomFieldTextPredicate
  | TCustomFieldNumberPredicate;

type TCustomFieldTextPredicate =
  | 'is'
  | 'not_is'
  | 'contains'
  | 'not_contains'
  | 'begins_with'
  | 'not_begins_with'
  | 'ends_on'
  | 'not_ends_on'
  | 'is_empty'
  | 'not_is_empty';

type TCustomFieldSelectPredicate =
  | 'is_empty'
  | 'not_is_empty'
  | 'is_one_of'
  | 'not_is_one_of'
  | 'has_value'
  | 'not_has_value';

type TCustomFieldCheckboxPredicate = 'is_checked' | 'not_is_checked';

type TCustomFieldDatePredicate =
  | 'is_empty'
  | 'not_is_empty'
  | 'is_before'
  | 'is_exactly'
  | 'is_after';

type TCustomFieldNumberPredicate =
  | 'is_equal'
  | 'not_is_equal'
  | 'is_larger_than'
  | 'is_larger_than_or_equal'
  | 'is_smaller_than'
  | 'is_smaller_than_or_equal'
  | 'is_empty'
  | 'not_is_empty';

export type TRule =
  | {
      ruleType?: 'custom_field_text';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?:
        | 'is'
        | 'not_is'
        | 'contains'
        | 'not_contains'
        | 'begins_with'
        | 'not_begins_with'
        | 'ends_on'
        | 'not_ends_on';
      value?: string;
    }
  | {
      ruleType?: 'custom_field_text';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'custom_field_select';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'has_value' | 'not_has_value';
      /**
       * The id of one of the options of the custom field
       */
      value?: string;
    }
  | {
      ruleType?: 'custom_field_select';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'custom_field_select';
      /**
       * The IDs of a custom fields
       */
      customFieldId?: string;
      predicate?: 'is_one_of' | 'not_is_one_of';
      value?: string[];
    }
  | {
      ruleType?: 'custom_field_checkbox';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_checked' | 'not_is_checked';
      value?: undefined;
    }
  | {
      ruleType?: 'custom_field_date';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_before' | 'is_exactly' | 'is_after';
      /**
       * The date formatted as yyyy-mm-dd
       */
      value?: string;
    }
  | {
      ruleType?: 'custom_field_date';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'custom_field_number';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?:
        | 'is_equal'
        | 'not_is_equal'
        | 'is_larger_than'
        | 'is_larger_than_or_equal'
        | 'is_smaller_than'
        | 'is_smaller_than_or_equal';
      value?: number;
    }
  | {
      ruleType?: 'custom_field_number';
      /**
       * The ID of a custom field
       */
      customFieldId?: string;
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'role';
      predicate?:
        | 'is_admin'
        | 'not_is_admin'
        | 'is_project_moderator'
        | 'not_is_project_moderator'
        | 'is_normal_user'
        | 'not_is_normal_user';
      value?: undefined;
    }
  | {
      ruleType?: 'email';
      predicate?:
        | 'is'
        | 'not_is'
        | 'contains'
        | 'not_contains'
        | 'begins_with'
        | 'not_begins_with'
        | 'ends_on'
        | 'not_ends_on';
      value?: string;
    }
  | {
      ruleType?: 'lives_in';
      predicate?: 'has_value' | 'not_has_value';
      /**
       * The id of an area
       */
      value?: string;
    }
  | {
      ruleType?: 'lives_in';
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'lives_in';
      /**
       * The IDs of areas
       */
      predicate?: 'is_one_of' | 'not_is_one_of';
      value?: string[];
    }
  | {
      ruleType?: 'registration_completed_at';
      predicate?: 'is_before' | 'is_exactly' | 'is_after';
      /**
       * The date formatted as yyyy-mm-dd
       */
      value?: string;
    }
  | {
      ruleType?: 'registration_completed_at';
      predicate?: 'is_empty' | 'not_is_empty';
      value?: undefined;
    }
  | {
      ruleType?: 'participated_in_project';
      predicate?:
        | 'not_in'
        | 'not_posted_in'
        | 'not_commented_in'
        | 'not_voted_idea_in'
        | 'not_voted_comment_in'
        | 'not_budgeted_in'
        | 'not_volunteered_in';

      /**
       * The id of a project
       */
      value?: string;
    }
  | {
      ruleType?: 'participated_in_project';
      predicate?:
        | 'in'
        | 'posted_in'
        | 'commented_in'
        | 'voted_idea_in'
        | 'voted_comment_in'
        | 'budgeted_in'
        | 'volunteered_in';

      /**
       * The IDs of projects
       */
      value?: string[];
    }
  | {
      ruleType?: 'participated_in_topic';
      predicate?:
        | 'not_in'
        | 'not_posted_in'
        | 'not_commented_in'
        | 'not_voted_idea_in'
        | 'not_voted_comment_in';
      /**
       * The id of a topic
       */
      value?: string;
    }
  | {
      ruleType?: 'participated_in_topic';
      predicate?:
        | 'in'
        | 'posted_in'
        | 'commented_in'
        | 'voted_idea_in'
        | 'voted_comment_in';
      /**
       * The IDs of topics
       */
      value?: string[];
    }
  | {
      ruleType?: 'participated_in_idea_status';
      predicate?:
        | 'not_in'
        | 'not_posted_in'
        | 'not_commented_in'
        | 'not_voted_idea_in'
        | 'not_voted_comment_in';
      /**
       * The id of an idea status
       */
      value?: string;
    }
  | {
      ruleType?: 'participated_in_idea_status';
      predicate?:
        | 'in'
        | 'posted_in'
        | 'commented_in'
        | 'voted_idea_in'
        | 'voted_comment_in';
      /**
       * The IDs of idea statuses
       */
      value?: string[];
    }
  | {
      ruleType?: 'verified';
      predicate?: 'is_verified' | 'not_is_verified';
    };

export const ruleTypeConstraints = {
  custom_field_text: {
    is: TextValueSelector,
    not_is: TextValueSelector,
    contains: TextValueSelector,
    not_contains: TextValueSelector,
    begins_with: TextValueSelector,
    not_begins_with: TextValueSelector,
    ends_on: TextValueSelector,
    not_ends_on: TextValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  custom_field_select: {
    has_value: CustomFieldOptionValueSelector,
    not_has_value: CustomFieldOptionValueSelector,
    is_one_of: CustomFieldOptionValuesSelector,
    not_is_one_of: CustomFieldOptionValuesSelector,
    is_empty: null,
    not_is_empty: null,
  },
  custom_field_checkbox: {
    is_checked: null,
    not_is_checked: null,
  },
  custom_field_date: {
    is_before: DateValueSelector,
    is_exactly: DateValueSelector,
    is_after: DateValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  custom_field_number: {
    is_equal: NumberValueSelector,
    not_is_equal: NumberValueSelector,
    is_larger_than: NumberValueSelector,
    is_larger_than_or_equal: NumberValueSelector,
    is_smaller_than: NumberValueSelector,
    is_smaller_than_or_equal: NumberValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  email: {
    is: TextValueSelector,
    not_is: TextValueSelector,
    contains: TextValueSelector,
    not_contains: TextValueSelector,
    begins_with: TextValueSelector,
    not_begins_with: TextValueSelector,
    ends_on: TextValueSelector,
    not_ends_on: TextValueSelector,
  },
  lives_in: {
    has_value: AreaValueSelector,
    not_has_value: AreaValueSelector,
    is_one_of: AreaValuesSelector,
    not_is_one_of: AreaValuesSelector,
    is_empty: null,
    not_is_empty: null,
  },
  registration_completed_at: {
    is_before: DateValueSelector,
    is_exactly: DateValueSelector,
    is_after: DateValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  role: {
    is_admin: null,
    not_is_admin: null,
    is_project_moderator: null,
    not_is_project_moderator: null,
    is_normal_user: null,
    not_is_normal_user: null,
  },
  participated_in_project: {
    in: ProjectValuesSelector,
    not_in: ProjectValueSelector,
    posted_in: ProjectValuesSelector,
    not_posted_in: ProjectValueSelector,
    commented_in: ProjectValuesSelector,
    not_commented_in: ProjectValueSelector,
    voted_idea_in: ProjectValuesSelector,
    not_voted_idea_in: ProjectValueSelector,
    voted_comment_in: ProjectValuesSelector,
    not_voted_comment_in: ProjectValueSelector,
    budgeted_in: ProjectValuesSelector,
    not_budgeted_in: ProjectValueSelector,
    volunteered_in: ProjectValuesSelector,
    not_volunteered_in: ProjectValueSelector,
  },
  participated_in_topic: {
    in: TopicValuesSelector,
    not_in: TopicValueSelector,
    posted_in: TopicValuesSelector,
    not_posted_in: TopicValueSelector,
    commented_in: TopicValuesSelector,
    not_commented_in: TopicValueSelector,
    voted_idea_in: TopicValuesSelector,
    not_voted_idea_in: TopicValueSelector,
    voted_comment_in: TopicValuesSelector,
    not_voted_comment_in: TopicValueSelector,
  },
  participated_in_idea_status: {
    in: IdeaStatusValuesSelector,
    not_in: IdeaStatusValueSelector,
    posted_in: IdeaStatusValuesSelector,
    not_posted_in: IdeaStatusValueSelector,
    commented_in: IdeaStatusValuesSelector,
    not_commented_in: IdeaStatusValueSelector,
    voted_idea_in: IdeaStatusValuesSelector,
    not_voted_idea_in: IdeaStatusValueSelector,
    voted_comment_in: IdeaStatusValuesSelector,
    not_voted_comment_in: IdeaStatusValueSelector,
  },
  verified: {
    is_verified: null,
    not_is_verified: null,
  },
};
