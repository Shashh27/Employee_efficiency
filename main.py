import datetime
from fastapi import FastAPI , HTTPException
import jwt 
from db import database, connect_db, disconnect_db
from datetime import date, datetime, timedelta
from pydantic import BaseModel
from typing import List , Dict, Optional
from fastapi.middleware.cors import CORSMiddleware

SECRET_KEY = "9f1c8b72e72d99a45723c98b5a8e14d0e8d9f38a6fb5c7158e3c7a78a3f6db91" 
ALGORITHM = "HS256"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

@app.get("/production_reports")
async def get_production_reports():
    query = "SELECT * FROM public.new_report"
    results = await database.fetch_all(query)
    return [dict(result) for result in results]

# Pydantic models for request validation
class ReportPanelEntryCreate(BaseModel):
    start_time: str
    end_time: str
    work_order: str
    process: str
    dia: str
    item_name: str
    quantity: int
    setup_time: float
    mc_time: float
    loading_unloading_time: float
    fld_breakdown_time: float
    no_load_time: float

class ProductionReportCreate(BaseModel):
    operator_name: str
    shift: str
    machine_name: str
    report_date: date
    shift_time: str
    machine_number: int
    quality_rework: str
    multi_machine_operat: str
    rejection: str
    actual_time: float
    ideal_time: float
    total_time_loss: float
    time_loss_no_load: float
    panel_entries: List[ReportPanelEntryCreate]

class OProductionReportCreate(BaseModel):
    operator_name: str
    shift: str
    machine_name: str
    report_date: date
    shift_time: str
    machine_number: int
    quality_rework: str
    multi_machine_operat: str
    rejection: str
    actual_time: float
    ideal_time: float
    total_time_loss: float
    time_loss_no_load: float
    status: Optional[str] = None    
    panel_entries: List[ReportPanelEntryCreate]

class SProductionReportCreate(BaseModel):
    operator_name: str
    shift: str
    machine_name: str
    report_date: date
    shift_time: str
    machine_number: int
    quality_rework: str
    multi_machine_operat: str
    rejection: str
    actual_time: float
    ideal_time: float
    total_time_loss: float
    time_loss_no_load: float
    status: Optional[str] = None    
    panel_entries: List[ReportPanelEntryCreate]

class StatusUpdateRequest(BaseModel):
    operator_name: str
    report_date: date
    status: str

class SignupRequest(BaseModel):
    username: str
    email : str
    password: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

# POST endpoint to insert data
@app.post("/reports")
async def create_report(report: ProductionReportCreate):
    try:
        # Insert main report
        report_query = """
            INSERT INTO public.new_report (
                operator_name, shift, machine_name, report_date, shift_time, 
                machine_number, quality_rework, multi_machine_operat, rejection, 
                actual_time, ideal_time, total_time_loss, time_loss_no_load
            ) VALUES (
                :operator_name, :shift, :machine_name, :report_date, :shift_time, 
                :machine_number, :quality_rework, :multi_machine_operat, :rejection, 
                :actual_time, :ideal_time, :total_time_loss, :time_loss_no_load
            ) RETURNING report_id
        """
        
        # Execute the main report query and get the report_id
        report_values = report.dict(exclude={"panel_entries"})
        report_result = await database.fetch_one(report_query, values=report_values)
        
        if not report_result:
            raise HTTPException(status_code=500, detail="Failed to create report")
            
        report_id = report_result['report_id']

        # Insert panel entries
        for entry in report.panel_entries:
            entry_query = """
                INSERT INTO public.report_panel_entries (
                    report_id, start_time, end_time, work_order, process, dia, 
                    item_name, quantity, setup_time, mc_time, 
                    loading_unloading_time, fld_breakdown_time, no_load_time
                ) VALUES (
                    :report_id, :start_time, :end_time, :work_order, :process, :dia, 
                    :item_name, :quantity, :setup_time, :mc_time, 
                    :loading_unloading_time, :fld_breakdown_time, :no_load_time
                )
            """
            entry_values = {**entry.dict(), "report_id": report_id}
            await database.execute(entry_query, values=entry_values)

        return {"message": "Report and panel entries created successfully", "report_id": report_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports", response_model=Dict[date, List[OProductionReportCreate]])
async def get_reports(operator_name: str):
    try:
        # First, get all unique dates for this operator
        dates_query = """
            SELECT DISTINCT report_date 
            FROM public.new_report 
            WHERE operator_name = :operator_name 
            ORDER BY report_date DESC
        """
        dates_results = await database.fetch_all(dates_query, {"operator_name": operator_name})

        if not dates_results:
            raise HTTPException(status_code=404, detail="No reports found for the given operator")

        # Initialize result dictionary
        reports_by_date = {}

        # For each date, get all reports
        for date_result in dates_results:
            report_date = date_result['report_date']
            
            # Get all reports for this date and operator
            reports_query = """
                SELECT * FROM public.new_report
                WHERE operator_name = :operator_name AND report_date = :report_date
            """
            report_results = await database.fetch_all(
                reports_query, 
                {"operator_name": operator_name, "report_date": report_date}
            )

            daily_reports = []
            for report_result in report_results:
                # Get panel entries for each report
                panel_entries_query = """
                    SELECT * FROM public.report_panel_entries 
                    WHERE report_id = :report_id
                """
                panel_entries_result = await database.fetch_all(
                    panel_entries_query, 
                    {"report_id": report_result["report_id"]}
                )

                # Convert panel entries to Pydantic models
                panel_entries = [
                    ReportPanelEntryCreate(**dict(entry)) 
                    for entry in panel_entries_result
                ]

                # Create report object
                report = OProductionReportCreate(
                    report_id=report_result["report_id"],
                    operator_name=report_result["operator_name"],
                    shift=report_result["shift"],
                    machine_name=report_result["machine_name"],
                    report_date=report_result["report_date"],
                    shift_time=report_result["shift_time"],
                    machine_number=report_result["machine_number"],
                    quality_rework=report_result["quality_rework"],
                    multi_machine_operat=report_result["multi_machine_operat"],
                    rejection=report_result["rejection"],
                    actual_time=report_result["actual_time"],
                    ideal_time=report_result["ideal_time"],
                    total_time_loss=report_result["total_time_loss"],
                    time_loss_no_load=report_result["time_loss_no_load"],
                    status=report_result["status"],
                    panel_entries=panel_entries
                )
                daily_reports.append(report)

            # Add reports for this date to the result dictionary
            reports_by_date[report_date] = daily_reports

        return reports_by_date

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/supervisor_reports", response_model=List[SProductionReportCreate])
async def get_reports():
    try:
        # Get all reports
        reports_query = "SELECT * FROM public.new_report"
        report_results = await database.fetch_all(reports_query)

        all_reports = []
        for report_result in report_results:
            # Get panel entries for each report
            panel_entries_query = """
                SELECT * FROM public.report_panel_entries 
                WHERE report_id = :report_id
            """
            panel_entries_result = await database.fetch_all(
                panel_entries_query, 
                {"report_id": report_result["report_id"]}
            )

            # Convert panel entries to Pydantic models
            panel_entries = [
                ReportPanelEntryCreate(**dict(entry)) 
                for entry in panel_entries_result
            ]

            # Create report object
            report = SProductionReportCreate(
                report_id=report_result["report_id"],
                operator_name=report_result["operator_name"],
                shift=report_result["shift"],
                machine_name=report_result["machine_name"],
                report_date=report_result["report_date"],
                shift_time=report_result["shift_time"],
                machine_number=report_result["machine_number"],
                quality_rework=report_result["quality_rework"],
                multi_machine_operat=report_result["multi_machine_operat"],
                rejection=report_result["rejection"],
                actual_time=report_result["actual_time"],
                ideal_time=report_result["ideal_time"],
                total_time_loss=report_result["total_time_loss"],
                time_loss_no_load=report_result["time_loss_no_load"],
                status=report_result["status"],
                panel_entries=panel_entries
            )
            all_reports.append(report)

        return all_reports

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/update_status")
async def update_status(status_update: StatusUpdateRequest):
    query = """
    UPDATE public.new_report
    SET status = :status
    WHERE operator_name = :operator_name AND report_date = :report_date
    """
    values = {
        "status": status_update.status,
        "operator_name": status_update.operator_name,
        "report_date": status_update.report_date,
    }
    
    result = await database.execute(query, values)

    if result == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    return {"message": "Status updated successfully"}


@app.post("/signup")
async def signup(signup_update: SignupRequest):
    query2 = "SELECT username FROM public.users WHERE username = :username"
    existing_user = await database.fetch_one(query2, {"username": signup_update.username})

    if existing_user:
        return {"message": "Username already exists"}
    
    query3 = "select email from public.users where email = :email"
    existing_email = await database.fetch_one(query3 , {"email": signup_update.email})

    if existing_email:
        return {"message": "email alraedy exists"}

    query = """
        INSERT INTO public.users (username, email, password, role) 
        VALUES (:username, :email, :password, :role)
    """
    values = {
        "username": signup_update.username,
        "email": signup_update.email,
        "password": signup_update.password,
        "role": signup_update.role
    }

    try:
        await database.execute(query, values)
        return {"message": "Data inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/login")
async def login(login_update: LoginRequest):
    query = "select username, password ,role from public.users where username = :username and password= :password and role= :role"

    existing_user = await database.fetch_one(query , {"username": login_update.username , "password": login_update.password, "role": login_update.role})
    
    if existing_user:
        payload = {
            "sub": existing_user["username"],
            "role": existing_user["role"],
            "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return {"message": "login successfull", "token": token}
    else:
        return {"message": "login failed"}
    