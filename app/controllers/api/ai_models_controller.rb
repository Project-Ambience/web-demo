class Api::AiModelsController < Api::ApplicationController
  # Handles GET /api/ai_models/:id
  def show
    ai_model = AiModel.includes(:comments, :ratings).find(params[:id])

    render json: {
      id: ai_model.id,
      name: ai_model.name,
      description: ai_model.description,
      average_rating: ai_model.average_rating,
      clinician_type: ai_model.clinician_type.name,
      comments: ai_model.comments.order(created_at: :desc).as_json(only: [:id, :comment, :created_at])
    }
  end
end