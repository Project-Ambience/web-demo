class Api::ModelFineTuneRequestsController < Api::ApplicationController
  def create
    required_params = %i[name description fine_tune_task_id clinician_type_id file]
    missing = required_params.select { |key| params[key].blank? }

    if missing.any?
      render json: { error: "Missing required parameter(s): #{missing.join(', ')}" }, status: :bad_request
      return
    end

    fine_tune_task = FineTuneTask.find_by(id: params[:fine_tune_task_id])
    if fine_tune_task.nil?
      render json: { error: "Fine-tune task not found" }, status: :not_found
      return
    end

    clinician_type = ClinicianType.find_by(id: params[:clinician_type_id])
    if clinician_type.nil?
      render json: { error: "Clinician type not found" }, status: :not_found
      return
    end

    ai_model = AiModel.find_by(id: params[:ai_model_id])
    if ai_model.nil?
      render json: { error: "AI model not found" }, status: :not_found
      return
    end

    begin
      uploaded_file = params[:file]
      file_contents = uploaded_file.read
      data = JSON.parse(file_contents)
    rescue JSON::ParserError => e
      render json: { error: "Invalid JSON format: #{e.message}" }, status: :unprocessable_entity
      return
    end

    model_fine_tune_request = ModelFineTuneRequest.new(
      name: params[:name],
      description: params[:description],
      ai_model: ai_model,
      clinician_type: clinician_type,
      parameters: fine_tune_task.parameters,
      task: fine_tune_task.title,
      fine_tune_data: data
    )

    if model_fine_tune_request.save
      render json: model_fine_tune_request, status: :created
      return
    end

    render json: { error: model_fine_tune_request.errors.full_messages }, status: :bad_request
  end

  def update_status
    request_id = params[:id]
    status = params[:status]
    adapter_path = params[:adapter_path]

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
      ai_model = create_ai_model(model_fine_tune_request, adapter_path)
      model_fine_tune_request.update(new_ai_model_id: ai_model.id)
      model_fine_tune_request.save!
    when "fail"
      model_fine_tune_request.failed!
    else
      render json: { error: "Invalid status" }, status: :unprocessable_entity and return
    end

    render json: { message: "Status updated successfully" }, status: :ok
  end

  private

  def create_ai_model(model_fine_tune_request)
    ai_model = AiModel.create!(
      name: model_fine_tune_request.name,
      description: model_fine_tune_request.description,
      clinician_type_id: model_fine_tune_request.clinician_type_id,
      base_model_id: model_fine_tune_request.ai_model_id,
      path: model_fine_tune_request.ai_model.path,
      adapter_path: model_fine_tune_request.adapter_path,
      keywords: model_fine_tune_request.ai_model.keywords
    )

    ai_model
  end
end
