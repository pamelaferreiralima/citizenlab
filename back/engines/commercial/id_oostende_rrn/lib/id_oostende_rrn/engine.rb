# frozen_string_literal: true

module IdOostendeRrn
  class Engine < ::Rails::Engine
    isolate_namespace IdOostendeRrn

    config.to_prepare do
      Verification::VerificationService.add_method(
        OostendeRrnVerification.new
      )
    end
  end
end
