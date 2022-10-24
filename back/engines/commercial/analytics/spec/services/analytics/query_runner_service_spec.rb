# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryRunnerService do
  describe 'run' do
    before_all do
      create(:dimension_type)
      create(:dimension_type, name: 'initiative')
    end

    it 'return the ID field for each post' do
      ideas = create_list(:idea, 5)
      query_param = ActionController::Parameters.new(fact: 'post', fields: 'id')
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, pagination = runner.run(query)

      expect(results).to match_array(ideas.map { |idea| { 'id' => idea.id } })
      expect(pagination).to be_nil
    end

    it 'return groups with aggregations' do
      idea = create(:idea)
      initiative = create(:initiative)
      create_list(:vote, 2, votable: idea)
      create_list(:vote, 1, votable: initiative)

      query_param = ActionController::Parameters.new(
        fact: 'post',
        groups: 'type.name',
        aggregations: {
          votes_count: %w[sum]
        }
      )
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)

      expected_result = [
        { 'type.name' => 'initiative', 'sum_votes_count' => 1 },
        { 'type.name' => 'idea', 'sum_votes_count' => 2 }
      ]
      expect(results).to eq expected_result
    end

    it 'return filtered ideas count' do
      create(:idea)
      create(:initiative)

      query_param = ActionController::Parameters.new(
        fact: 'post',
        filters: {
          type: {
            name: 'idea'
          }
        },
        aggregations: {
          all: 'count'
        }
      )
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)
      expect(results).to eq([{ 'count' => 1 }])
    end

    it 'return first two sorted posts' do
      ideas = create_list(:idea, 5)
      initiatives = create_list(:initiative, 5)

      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        sort: { id: 'ASC' }
      )
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)
      posts = (ideas + initiatives)
        .sort_by { |p| p[:id] }
        .map { |p| { 'id' => p.id } }
      expect(results).to eq(posts)
    end

    context 'result limiting and paging' do
      before_all do
        create_list(:idea, 10)
      end

      it 'returns the first page of 2 items from 10 posts' do
        query_param = ActionController::Parameters.new(
          fact: 'post',
          fields: 'id',
          sort: { id: 'ASC' },
          page: { size: 2, number: 1 }
        )
        runner = described_class.new
        results, * = runner.run(Analytics::Query.new(query_param))

        expect(results.length).to eq(2)
        expect(results.first['id']).to eq(Idea.order(:id).first.id)
      end

      it 'returns the second page of 3 items from 10 posts' do
        query_param = ActionController::Parameters.new(
          fact: 'post',
          fields: 'id',
          sort: { id: 'ASC' },
          page: { size: 3, number: 2 }
        )
        runner = described_class.new
        results, * = runner.run(Analytics::Query.new(query_param))

        expect(results.length).to eq(3)
        expect(results.first['id']).to eq(Idea.order(:id).fourth.id)
        expect(results.second['id']).to eq(Idea.order(:id).fifth.id)
      end

      it 'returns nothing if the page number is too high for the size' do
        query_param = ActionController::Parameters.new(
          fact: 'post',
          fields: 'id',
          sort: { id: 'ASC' },
          page: { size: 5, number: 3 }
        )
        runner = described_class.new
        results, * = runner.run(Analytics::Query.new(query_param))

        expect(results).to eq([])
      end
    end
  end
end
