class RatingsController < ApplicationController
  def create
    @ai_model = AiModel.find(params[:ai_model_id])
    @rating = @ai_model.ratings.build(rating: params[:rating])

    @rating.save
    redirect_to ai_model_path(@ai_model)
  end
  
  private

  def rating_params
    params.require(:rating).permit(:rating)
  end
end
