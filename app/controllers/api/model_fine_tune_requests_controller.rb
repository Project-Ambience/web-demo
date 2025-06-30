class Api::ModelFineTuneRequestsController < Api::ApplicationController
  def update_status
    request_id = params[:id]
    status = params[:status]

    model_fine_tune_request = ModelFineTuneRequest.find_by(id: request_id)

    if model_fine_tune_request.nil?
      render json: { error: "Record not found" }, status: :not_found and return
    end

    if !model_fine_tune_request.in_progress?
      render json: { error: "Request is not ready to update" }, status: :bad_request and return
    end

    case status
    when "success"
      model_fine_tune_request.done!
      create_ai_model(model_fine_tune_request)
    when "fail"
      model_fine_tune_request.failed!
    else
      render json: { error: "Invalid status" }, status: :unprocessable_entity and return
    end

    render json: { message: "Status updated successfully" }, status: :ok
  end

  private

  def create_ai_model(model_fine_tune_request)
    AiModel.create!(
      name: model_fine_tune_request.name,
      description: model_fine_tune_request.description,
      clinician_type_id: model_fine_tune_request.clinician_type_id,
      base_model_id: model_fine_tune_request.ai_model_id
    )
  end
end
