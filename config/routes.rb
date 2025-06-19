Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  namespace :api do
    namespace :internal do
      resources :results, only: [:create]
    end
    resources :clinician_types, only: [:index]
    resources :ai_models, only: [:index, :show] do
      resources :comments, only: [:create]
      resources :ratings, only: [:create]
    end
    
    resources :conversations, only: [:index, :show, :create, :update, :destroy] do
      resources :messages, only: [:create]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

end
