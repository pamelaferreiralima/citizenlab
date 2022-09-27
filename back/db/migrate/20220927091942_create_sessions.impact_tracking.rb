# frozen_string_literal: true

# This migration comes from impact_tracking (originally 20220927111312)

class CreateSessions < ActiveRecord::Migration[6.1]
  def change
    create_table :impact_tracking_sessions, id: false do |t|
      t.string 'monthly_user_hash', null: false
      t.string 'highest_role'
      t.datetime 'created_at', null: false
    end
  end
end
