class Api::ModelInstallRequestsController < Api::ApplicationController
  def update_status
    request_id = params[:id]
    status = params[:status]

    model_install_request = ModelInstallRequest.find_by(id: request_id)

    if model_install_request.nil?
      render json: { error: "Record not found" }, status: :not_found and return
    end

    if !model_install_request.in_progress?
      render json: { error: "Request is not ready to update" }, status: :bad_request and return
    end

    case status
    when "success"
      model_install_request.done!
      create_ai_model(model_install_request)
    when "fail"
      model_install_request.failed!
    else
      render json: { error: "Invalid status" }, status: :unprocessable_entity and return
    end

    render json: { message: "Status updated successfully" }, status: :ok
  end

  private

  def create_ai_model(model_install_request)
    AiModel.create!(
      name: model_install_request.name,
      description: model_install_request.description,
      clinician_type_id: model_install_request.clinician_type_id,
      keywords: [ model_install_request.keyword ],
      path: model_install_request.path,
      family: model_install_request.family,
      parameter_size: model_install_request.parameter_size
    )
  end
end
