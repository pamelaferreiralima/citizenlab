$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "id_bosa_fas/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "id_bosa_fas"
  s.version     = IdBosaFas::VERSION
  s.summary     = "Authentication and verification using the Belgian eID and itsme system"
  s.authors     = ["Koen Gremmelprez"]
  s.licenses    = ['CitizenLab Commercial License']
  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "verification"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end