# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'id_oostende_rrn/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'id_oostende_rrn'
  s.version     = IdOostendeRrn::VERSION
  s.summary     = 'Verification by RRN (BE social security number) using an API from the city of Oostende'
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 6.1'
  s.add_dependency 'httparty', '~> 0.16.2'
  s.add_dependency 'verification'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
