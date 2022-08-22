# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Factory do
  describe '.instance' do
    it 'always returns the same object' do
      singleton = described_class.instance
      expect(described_class.instance).to equal singleton
    end
  end

  describe '.new' do
    it 'is a private method' do
      expect { described_class.new }.to raise_error NoMethodError
    end
  end

  describe '#participation_method_for' do
    subject(:participation_method) { described_class.instance.participation_method_for(project) }

    context 'for a project without participation context' do
      let(:project) { create :project_with_past_phases }

      it 'returns an instance of ParticipationMethod::None' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::None)
      end
    end

    context 'for an ideation project' do
      let(:project) { create :continuous_project, participation_method: 'ideation' }

      it 'returns an instance of ParticipationMethod::Ideation' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::Ideation)
      end
    end

    context 'for a budgeting project' do
      let(:project) { create :continuous_budgeting_project }

      it 'returns an instance of ParticipationMethod::Budgeting' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::Budgeting)
      end
    end

    context 'for a native survey project' do
      let(:project) { create :continuous_native_survey_project }

      it 'returns an instance of ParticipationMethod::NativeSurvey' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::NativeSurvey)
      end
    end

    context 'for a project with another participation method' do
      let(:project) { create :continuous_native_survey_project, participation_method: 'information' }

      it 'returns an instance of ParticipationMethod::Ideation' do
        expect(participation_method).to be_an_instance_of(ParticipationMethod::Ideation)
      end
    end
  end
end