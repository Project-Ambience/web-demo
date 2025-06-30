class Api::AiModelsController < Api::ApplicationController
  def show
    @ai_model = AiModel.includes(:comments, :ratings, :clinician_type, :fine_tune_tasks).find(params[:id])

    render json: @ai_model.as_json(
      include: {
        comments: { only: [ :id, :comment, :created_at ] },
        ratings: { only: [ :id, :rating ] },
        fine_tune_tasks: { only: [ :id, :title ] },
        model_fine_tune_requests: { only: [ :id, :name, :status, :created_at, :task, :new_ai_model_id ] }
      },
      methods: :average_rating,
      add_clinician_type_name: true
    )
  end
end
