class Api::ClinicianTypesController < Api::ApplicationController
  def index
    clinician_types = ClinicianType.includes(:ai_models).order(:name)

    render json: clinician_types.as_json(
      only: [:id, :name],
      include: { ai_models: { only: [:id, :name] } }
    )
  end
end