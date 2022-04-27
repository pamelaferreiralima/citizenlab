require 'rails_helper'

describe ProjectFilePolicy do
  subject { ProjectFilePolicy.new(user, file) }
  let(:scope) { ProjectFilePolicy::Scope.new(user, project.project_files) }

  context 'on a file in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:file) { create(:project_file, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to_not permit(:create)  }
      it { is_expected.to_not permit(:update)  }
      it { is_expected.to_not permit(:destroy) }

      it 'should index the file' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a mortal user' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to_not permit(:create)  }
      it { is_expected.to_not permit(:update)  }
      it { is_expected.to_not permit(:destroy) }

      it 'should index the file' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'should index the file' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on a file in a private admins project' do
    let(:project) { create(:private_admins_project) }
    let!(:file) { create(:project_file, project: project) }

    context 'for a user' do
      let(:user) { create(:user) }

      it { is_expected.to_not permit(:show)    }
      it { is_expected.to_not permit(:create)  }
      it { is_expected.to_not permit(:update)  }
      it { is_expected.to_not permit(:destroy) }

      it 'should not index the file' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'should index the file' do
        expect(scope.resolve.size).to eq 1
      end
    end
 end
end
