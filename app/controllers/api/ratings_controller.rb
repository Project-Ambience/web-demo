class Api::RatingsController < Api::ApplicationController
  def create
    ai_model = AiModel.find(params[:ai_model_id])
    rating = ai_model.ratings.build(rating_params)

    if rating.save
      render json: rating, status: :created
    else
      render json: { errors: rating.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def rating_params
    params.require(:rating).permit(:rating)
  end
end