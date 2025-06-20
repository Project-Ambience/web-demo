class Api::AiModelsController < Api::ApplicationController
  def show
    @ai_model = AiModel.includes(:comments, :ratings, :clinician_type).find(params[:id])
    
    render json: @ai_model.as_json(
      include: {
        comments: { only: [:id, :comment, :created_at] },
        ratings: { only: [:id, :rating] }
      },
      methods: :average_rating,
      add_clinician_type_name: true 
    )
  end
end