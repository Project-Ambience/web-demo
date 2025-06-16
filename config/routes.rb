Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :clinician_types, only: [:index]

    resources :ai_models, only: [:show] do
      resources :comments, only: [:create]
      resources :ratings, only: [:create]
    end
  end
end