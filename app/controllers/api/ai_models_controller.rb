class Api::AiModelsController < Api::ApplicationController
  def show
    @ai_model = AiModel.includes(:comments, :ratings, :clinician_type).find(params[:id])
    
    # --- FIX IS HERE ---
    # We now explicitly include the :average_rating method in the JSON response
    # and also include the clinician_type's name for a better UI experience.
    render json: @ai_model.as_json(
      include: {
        comments: { only: [:id, :comment, :created_at] },
        ratings: { only: [:id, :rating] }
      },
      methods: :average_rating,
      # Add a 'clinician_type' key to the JSON response with just the name
      add_clinician_type_name: true 
    )
  end
end