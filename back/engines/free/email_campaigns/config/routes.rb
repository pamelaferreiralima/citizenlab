EmailCampaigns::Engine.routes.draw do

  namespace :web_api, :defaults => { :format => :json } do
    namespace :v1 do
      resources :campaigns do
        post :send, action: :do_send, on: :member
        post :send_preview, on: :member
        get :preview, on: :member
        get :deliveries, on: :member
        get :stats, on: :member
      end


      resources :consents, only: [:index, :update] do
        patch 'by_campaign_id/:campaign_id', action: 'update_by_campaign_id', on: :collection
      end
    end
  end

  namespace :hooks, defaults: { format: :json } do
    resources :mailgun_events, only: [:create]
  end
end
