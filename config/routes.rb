Rails.application.routes.draw do
  namespace :api do
    resources :clinician_types, only: [:index]
    resources :ai_models, only: [:index, :show] do
      resources :comments, only: [:create]
      resources :ratings, only: [:create]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

end