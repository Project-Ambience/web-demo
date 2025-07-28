class Api::ModelFineTuneRequestsController < Api::ApplicationController
  def index
    sort_order = params[:sort_order] == "asc" ? :asc : :desc

    requests = ModelFineTuneRequest.includes(:ai_model, :clinician_type)
      .by_status(params[:status])
      .by_base_model(params[:base_model_id])
      .created_after(params[:start_date])
      .created_before(params[:end_date])
      .search_by_name(params[:search])
      .order(created_at: sort_order)

    paginated_requests = requests.page(params[:page]).per(20)

    render json: {
      requests: paginated_requests.as_json(
        only: [ :id, :name, :description, :fine_tuning_notes, :task, :created_at, :new_ai_model_id, :error_message, :parameters, :fine_tune_data ],
        methods: [ :status ],
        include: {
          ai_model: { only: [ :id, :name ] },
          clinician_type: { only: [ :id, :name ] }
        }
      ),
      pagination: {
        current_page: paginated_requests.current_page,
        total_pages: paginated_requests.total_pages,
        total_count: paginated_requests.total_count
      }
    }
  end

  def statistics
    counts = ModelFineTuneRequest.group(:status).count

    render json: {
      waiting_for_validation: counts["waiting_for_validation"] || 0,
      validating: counts["validating"] || 0,
      waiting_for_fine_tune: counts["waiting_for_fine_tune"] || 0,
      fine_tuning: counts["fine_tuning"] || 0
    }
  end

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
      fine_tune_data: data,
      fine_tuning_notes: params[:fine_tuning_notes]
    )

    if model_fine_tune_request.save
      broadcast_status_update(model_fine_tune_request)
      render json: model_fine_tune_request, status: :created
      return
    end

    render json: { error: model_fine_tune_request.errors.full_messages }, status: :bad_request
  end

  def update_status
    request = ModelFineTuneRequest.find_by(id: params[:id])
    return render json: { error: "Record not found" }, status: :not_found unless request

    case params[:status]
    when "validation_started"
      request.validating! if request.waiting_for_validation?
    when "validation_succeeded"
      request.waiting_for_fine_tune! if request.validating?
    when "validation_failed"
      request.update(status: :validation_failed, error_message: params[:error]) if request.validating?
    when "processing_started"
      request.fine_tuning! if request.waiting_for_fine_tune?
    when "success"
      if request.fine_tuning?
        request.done!
        ai_model = create_ai_model(request, params[:adapter_path])
        request.update(new_ai_model_id: ai_model.id)
      end
    when "fail"
      request.update(status: :failed, error_message: params[:error]) if request.fine_tuning?
    else
      return render json: { error: "Invalid status" }, status: :unprocessable_entity
    end

    broadcast_status_update(request)
    render json: { message: "Status updated successfully" }, status: :ok
  end

  private

  def broadcast_status_update(request)
    counts = ModelFineTuneRequest.group(:status).count
    statistics = {
      waiting_for_validation: counts["waiting_for_validation"] || 0,
      validating: counts["validating"] || 0,
      waiting_for_fine_tune: counts["waiting_for_fine_tune"] || 0,
      fine_tuning: counts["fine_tuning"] || 0
    }

    updated_request_json = request.as_json(
      only: [ :id, :name, :description, :fine_tuning_notes, :task, :created_at, :new_ai_model_id, :error_message, :parameters, :fine_tune_data ],
      methods: [ :status ],
      include: {
        ai_model: { only: [ :id, :name ] },
        clinician_type: { only: [ :id, :name ] }
      }
    )

    payload = {
      statistics: statistics,
      updated_request: updated_request_json
    }

    ActionCable.server.broadcast("fine_tune_status_channel", payload)
  end

  def create_ai_model(model_fine_tune_request, adapter_path)
    AiModel.create!(
      name: model_fine_tune_request.name,
      description: model_fine_tune_request.description,
      clinician_type_id: model_fine_tune_request.clinician_type_id,
      base_model_id: model_fine_tune_request.ai_model_id,
      path: model_fine_tune_request.ai_model.path,
      adapter_path: adapter_path,
      keywords: model_fine_tune_request.ai_model.keywords,
      speciality: model_fine_tune_request.task,
      family: model_fine_tune_request.ai_model.family,
      parameter_size: model_fine_tune_request.ai_model.parameter_size,
      fine_tuning_notes: model_fine_tune_request.fine_tuning_notes
    )
  end
end
