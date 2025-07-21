Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  namespace :api do
    resources :clinician_types, only: [ :index ]
    resources :model_fine_tune_requests, only: [ :create ]
    resources :ai_models, only: [ :index, :show ] do
      resources :comments, only: [ :create ]
      resources :ratings, only: [ :create ]
    end

    resources :conversations, only: [ :index, :show, :create, :update, :destroy ] do
      member do
        post :accept_feedback
        post :reject_feedback
      end
      resources :messages, only: [ :create ]
    end

    post "/model_install_requests/update_status", to: "model_install_requests#update_status"
    post "/model_fine_tune_requests/update_status", to: "model_fine_tune_requests#update_status"
    get "/rabbitmq/traffic", to: "rabbitmq#traffic"
  end

  get "up" => "rails/health#show", as: :rails_health_check

  mount ActionCable.server => "/cable"
end
