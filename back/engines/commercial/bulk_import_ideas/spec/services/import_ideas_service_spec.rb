# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportIdeasService do
  let(:service) { described_class.new }

  describe 'import_ideas' do
    before { create :idea_status, code: 'proposed' }

    it 'imports multiple ideas' do
      project1 = create :project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' }
      project2 = create :project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' }
      create :idea, project: project2
      user1 = create :user, email: 'userimport@citizenlab.co'
      user2 = create :user, email: 'userimport2@citizenlab.co'

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project 1',
          user_email: 'userimport@citizenlab.co'
        },
        {
          title_multiloc: { 'en' => 'My idea title 2' },
          body_multiloc: { 'en' => 'My idea description 2' },
          project_title: 'Project 2',
          user_email: 'userimport2@citizenlab.co'
        }
      ]
      service.import_ideas idea_rows

      expect(project1.reload.ideas_count).to eq 1
      idea1 = user1.ideas.first
      expect(idea1.project_id).to eq project1.id
      expect(idea1.title_multiloc).to eq({ 'en' => 'My idea title' })
      expect(idea1.body_multiloc).to eq({ 'en' => 'My idea description' })

      expect(project2.reload.ideas_count).to eq 2
      idea2 = user2.ideas.first
      expect(idea2.project_id).to eq project2.id
      expect(idea2.title_multiloc).to eq({ 'en' => 'My idea title 2' })
      expect(idea2.body_multiloc).to eq({ 'en' => 'My idea description 2' })
    end

    it 'imports ideas with publication info' do
      create :user, email: 'userimport@citizenlab.co'
      create :project, title_multiloc: { 'en' => 'Project title' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          published_at: '2022-07-18'
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.published_at).to eq Date.parse('2022-07-18')
      expect(idea.publication_status).to eq 'published'
    end

    it 'imports ideas with location info' do
      create :user, email: 'userimport@citizenlab.co'
      create :project, title_multiloc: { 'en' => 'Project title' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          latitude: 50.5035,
          longitude: 6.0944,
          location_description: 'Panorama sur les Hautes Fagnes / Hohes Venn'
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(RGeo::GeoJSON.encode(idea.location_point)&.dig('coordinates', 1)).to eq 50.5035
      expect(RGeo::GeoJSON.encode(idea.location_point)&.dig('coordinates', 0)).to eq 6.0944
      expect(idea.location_description).to eq 'Panorama sur les Hautes Fagnes / Hohes Venn'
    end

    it 'imports ideas in a phase' do
      create :user, email: 'userimport@citizenlab.co'
      project = create :project_with_phases, phases_count: 2, title_multiloc: { 'en' => 'Project title' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          phase_rank: 2
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.phase_ids).to eq [project.phases.order(:start_at).last.id]
    end

    it 'imports ideas with topics' do
      create :user, email: 'userimport@citizenlab.co'
      create :project, title_multiloc: { 'en' => 'Project title' }
      create :topic
      topic1 = create :topic, title_multiloc: { 'en' => 'Topic 1' }
      topic2 = create :topic, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Topic 2' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          topic_titles: ['Topic 1', 'Topic 2']
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.topic_ids).to match_array [topic1.id, topic2.id]
    end

    it 'imports ideas with images' do
      WebMock.disable_net_connect!
      FakeWeb.register_uri(:get, 'https://images.com/image.png', body: 'Hello World!')

      create :user, email: 'userimport@citizenlab.co'
      create :project, title_multiloc: { 'en' => 'Project title' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co',
          image_url: 'https://images.com/image.png'
        }
      ]

      service.import_ideas idea_rows

      expect(Idea.count).to eq 1
      idea = Idea.first
      expect(idea.idea_images.count).to eq 1
    end

    it 'does not accept invalid import data' do
      create :user, email: 'userimport@citizenlab.co'
      create :project, title_multiloc: { 'en' => 'Project title' }

      idea_rows = [
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Project title',
          user_email: 'userimport@citizenlab.co'
        },
        {
          title_multiloc: { 'en' => 'My idea title' },
          body_multiloc: { 'en' => 'My idea description' },
          project_title: 'Non-existing project',
          user_email: 'userimport@citizenlab.co'
        }
      ]
      expect { service.import_ideas idea_rows }.to raise_error BulkImportIdeas::Error
      expect(Idea.count).to eq 0
    end
  end

  describe 'xlsx_to_idea_rows' do
    it 'converts uploaded XLSX to more parseable format for the idea import method' do
      xlsx_array = [
        {
          'Title_nl-BE' => 'Mijn idee titel',
          'Title_fr-BE' => 'Mon idée titre',
          'Body_nl-BE' => 'Mijn idee inhoud',
          'Body_fr-BE' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
          'Project' => 'Project 1',
          'Phase' => 2,
          'Date (dd-mm-yyyy)' => '18-07-2022',
          'Topics' => 'topic 1;topic 2 ; topic 3',
          'Latitude' => 50.5035,
          'Longitude' => 6.0944,
          'Location Description' => 'Panorama sur les Hautes Fagnes / Hohes Venn',
          'Image URL' => 'https://images.com/image.png'
        },
        {
          'Title_en' => 'My wonderful idea title',
          'Body_en' => 'My wonderful idea content',
          'Email' => 'admin@citizenlab.co',
          'Project' => 'Project 2'
        }
      ]

      idea_rows = service.xlsx_to_idea_rows xlsx_array

      expect(idea_rows).to contain_exactly(
        a_hash_including(
          title_multiloc: { 'nl-BE' => 'Mijn idee titel', 'fr-BE' => 'Mon idée titre' },
          body_multiloc: { 'nl-BE' => 'Mijn idee inhoud', 'fr-BE' => 'Mon idée contenu' },
          user_email: 'moderator@citizenlab.co',
          project_title: 'Project 1',
          phase_rank: 2,
          topic_titles: ['topic 1', 'topic 2', 'topic 3'],
          published_at: '18-07-2022',
          latitude: 50.5035,
          longitude: 6.0944,
          location_description: 'Panorama sur les Hautes Fagnes / Hohes Venn',
          image_url: 'https://images.com/image.png'
        ),
        a_hash_including(
          title_multiloc: { 'en' => 'My wonderful idea title' },
          body_multiloc: { 'en' => 'My wonderful idea content' },
          user_email: 'admin@citizenlab.co',
          project_title: 'Project 2'
        )
      )
    end
  end
end
