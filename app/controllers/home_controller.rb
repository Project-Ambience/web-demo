class HomeController < ApplicationController
  def index
    query = params[:q]
    @clinician_types = ClinicianType.includes(:ai_models)
    @clinician_types = @clinician_types.where("name ILIKE ?", "%#{query}%") if query.present?
    @clinician_types = @clinician_types.page(params[:page]).per(9)
  end
  
end
  