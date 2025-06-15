Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  resources :ai_models, only: [:index, :show] do
    resources :ratings, only: [:create]
    resources :comments, only: [:create]
  end

  root "home#index"
end
