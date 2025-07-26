Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  namespace :api do
    resources :clinician_types, only: [ :index ]
    resources :few_shot_templates, only: [ :index, :show, :create, :update, :destroy ]
    resources :model_fine_tune_requests, only: [ :index, :create ] do
      member do
        post :start
      end
    end
    resources :ai_models, only: [ :index, :show ] do
      collection do
        get :tunable
      end
      resources :comments, only: [ :create ]
      resources :ratings, only: [ :create ]
    end

    resources :conversations, only: [ :index, :show, :create, :update, :destroy ] do
      member do
        post :accept_feedback
        post :reject_feedback
      end
      collection do
        get "by_ai_model/:ai_model_id", to: "conversations#conversation_by_ai_model"
      end
      resources :messages, only: [ :create ]
    end

    post "/model_install_requests/update_status", to: "model_install_requests#update_status"
    post "/model_fine_tune_requests/update_status", to: "model_fine_tune_requests#update_status"
    get "/rabbitmq/traffic", to: "rabbitmq#traffic"

    resources :inter_raters, only: [ :create ] do
      collection do
        get "response_pairs/:ai_model_id", action: :response_pairs
      end
    end

    resources :inter_rater_feedbacks, only: [ :create ]
  end

  get "up" => "rails/health#show", as: :rails_health_check

  mount ActionCable.server => "/cable"
end
