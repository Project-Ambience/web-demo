Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  
  namespace :api do
    resources :clinician_types, only: [:index]
    resources :ai_models, only: [:index, :show] do
      resources :comments, only: [:create]
      resources :ratings, only: [:create]
    end
    
    resources :conversations, only: [:index, :show, :create, :update, :destroy] do
      resources :messages, only: [:create]
    end

    post "/model_install_requests/update_status", to: "model_install_requests#update_status"

  end

  get "up" => "rails/health#show", as: :rails_health_check
end
