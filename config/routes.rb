Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  get "up" => "rails/health#show", as: :rails_health_check

  resources :ai_models, only: [:index, :show] do
    resources :ratings, only: [:create]
    resources :comments, only: [:create]
  end

  root "home#index"

  post "/model_install_requests/update_status", to: "model_install_requests#update_status"
end
