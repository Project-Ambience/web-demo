class Api::RatingsController < Api::ApplicationController
    before_action :set_ai_model

    def create
      @rating = @ai_model.ratings.new(rating_params)
  
      if @rating.save
        render json: @rating, status: :created
      else
        render json: @rating.errors, status: :unprocessable_entity
      end
    end
  
    private
  
    def set_ai_model
      @ai_model = AiModel.find(params[:ai_model_id])
    end
  
    def rating_params
      params.require(:rating).permit(:rating)
    end
end
