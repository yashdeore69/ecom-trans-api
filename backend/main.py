from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

from database import Base, engine, get_db
from models import User, Transaction, Log
from schemas import UserCreate, UserOut, TransactionCreate, TransactionOut, LogOut
from auth import get_password_hash, authenticate_user, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware
# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce Transaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to log actions
def log_action(db: Session, user_id: int, action: str, detail: str = None):
    log = Log(user_id=user_id, action=action, detail=detail)
    db.add(log)
    db.commit()

# User registration
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == user.username) | (User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        balance=0.0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    log_action(db, db_user.id, "register", f"User {db_user.username} registered.")
    return db_user

# User login (JWT token)
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    log_action(db, user.id, "login", f"User {user.username} logged in.")
    return {"access_token": access_token, "token_type": "bearer"}

# Get current user profile
@app.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Create a transaction (protected)
@app.post("/transactions", response_model=TransactionOut)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check balance for payments
    if transaction.type == "payment" and current_user.balance < transaction.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    # Update balance
    if transaction.type == "payment":
        current_user.balance -= transaction.amount
    elif transaction.type == "refund":
        current_user.balance += transaction.amount
    db_transaction = Transaction(
        user_id=current_user.id,
        amount=transaction.amount,
        type=transaction.type,
        status="completed",
        description=transaction.description
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    log_action(
        db,
        current_user.id,
        "transaction",
        f"{transaction.type.capitalize()} of {transaction.amount} (ID: {db_transaction.id})"
    )
    return db_transaction

# Get all transactions for current user
@app.get("/transactions", response_model=List[TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

# Get logs for current user
@app.get("/logs", response_model=List[LogOut])
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Log).filter(Log.user_id == current_user.id).order_by(Log.timestamp.desc()).all()