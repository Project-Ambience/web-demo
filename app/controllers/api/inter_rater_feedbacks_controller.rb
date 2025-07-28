class Api::InterRaterFeedbacksController < Api::ApplicationController
  def create
    inter_rater_feedback = InterRaterFeedback.new(inter_rater_feedback_params)

    if inter_rater_feedback.save
      render json: inter_rater_feedback, status: :created
    else
      render json: { errors: inter_rater_feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def inter_rater_feedback_params
    params.require(:inter_rater_feedback).permit(
      :inter_rater_id,
      :rating,
      :comment
    )
  end
end
