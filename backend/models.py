from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar        = db.Column(db.String(10), default='🌿')
    level         = db.Column(db.Integer, default=1)
    xp            = db.Column(db.Integer, default=0)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    moods    = db.relationship('MoodEntry',    backref='user', lazy=True, cascade='all,delete-orphan')
    habits   = db.relationship('Habit',        backref='user', lazy=True, cascade='all,delete-orphan')
    goals    = db.relationship('Goal',         backref='user', lazy=True, cascade='all,delete-orphan')
    health   = db.relationship('HealthLog',    backref='user', lazy=True, cascade='all,delete-orphan')
    finance  = db.relationship('FinanceEntry', backref='user', lazy=True, cascade='all,delete-orphan')
    notes    = db.relationship('Note',         backref='user', lazy=True, cascade='all,delete-orphan')
    pillars  = db.relationship('PillarScore',  backref='user', lazy=True, cascade='all,delete-orphan')
    def to_dict(self):
        return {'id':self.id,'name':self.name,'email':self.email,'avatar':self.avatar,'level':self.level,'xp':self.xp}

class PillarScore(db.Model):
    __tablename__ = 'pillar_scores'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    label      = db.Column(db.String(30), nullable=False)
    score      = db.Column(db.Integer, default=50)
    color      = db.Column(db.String(10))
    icon       = db.Column(db.String(5))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    def to_dict(self):
        return {'id':self.id,'label':self.label,'score':self.score,'color':self.color,'icon':self.icon}

class MoodEntry(db.Model):
    __tablename__ = 'mood_entries'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date       = db.Column(db.Date, default=date.today)
    mood       = db.Column(db.Integer, nullable=False)
    mood_label = db.Column(db.String(20))
    energy     = db.Column(db.Integer, default=5)
    journal    = db.Column(db.Text)
    tags       = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def to_dict(self):
        return {'id':self.id,'date':str(self.date),'mood':self.mood,'mood_label':self.mood_label,'energy':self.energy,'journal':self.journal,'tags':self.tags}

class Habit(db.Model):
    __tablename__ = 'habits'
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name        = db.Column(db.String(100), nullable=False)
    icon        = db.Column(db.String(10), default='✅')
    category    = db.Column(db.String(30), default='health')
    color       = db.Column(db.String(10), default='#7c3aed')
    target_days = db.Column(db.Integer, default=7)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    logs        = db.relationship('HabitLog', backref='habit', lazy=True, cascade='all,delete-orphan')
    def to_dict(self):
        return {'id':self.id,'name':self.name,'icon':self.icon,'category':self.category,'color':self.color,'target_days':self.target_days}

class HabitLog(db.Model):
    __tablename__ = 'habit_logs'
    id        = db.Column(db.Integer, primary_key=True)
    habit_id  = db.Column(db.Integer, db.ForeignKey('habits.id'), nullable=False)
    user_id   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date      = db.Column(db.Date, default=date.today)
    completed = db.Column(db.Boolean, default=False)
    def to_dict(self):
        return {'id':self.id,'habit_id':self.habit_id,'date':str(self.date),'completed':self.completed}

class Goal(db.Model):
    __tablename__ = 'goals'
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title       = db.Column(db.String(200), nullable=False)
    category    = db.Column(db.String(30), default='personal')
    color       = db.Column(db.String(10), default='#7c3aed')
    icon        = db.Column(db.String(10), default='🎯')
    progress    = db.Column(db.Integer, default=0)
    target_date = db.Column(db.Date)
    completed   = db.Column(db.Boolean, default=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    def to_dict(self):
        return {'id':self.id,'title':self.title,'category':self.category,'color':self.color,'icon':self.icon,'progress':self.progress,'target_date':str(self.target_date) if self.target_date else None,'completed':self.completed}

class HealthLog(db.Model):
    __tablename__ = 'health_logs'
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date         = db.Column(db.Date, default=date.today)
    steps        = db.Column(db.Integer, default=0)
    water_glasses= db.Column(db.Integer, default=0)
    sleep_hours  = db.Column(db.Float, default=0)
    calories     = db.Column(db.Integer, default=0)
    weight_kg    = db.Column(db.Float)
    heart_rate   = db.Column(db.Integer)
    bp_systolic  = db.Column(db.Integer)
    bp_diastolic = db.Column(db.Integer)
    workout_mins = db.Column(db.Integer, default=0)
    def to_dict(self):
        return {'id':self.id,'date':str(self.date),'steps':self.steps,'water_glasses':self.water_glasses,'sleep_hours':self.sleep_hours,'calories':self.calories,'weight_kg':self.weight_kg,'heart_rate':self.heart_rate,'workout_mins':self.workout_mins}

class FinanceEntry(db.Model):
    __tablename__ = 'finance_entries'
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date        = db.Column(db.Date, default=date.today)
    type        = db.Column(db.String(10), nullable=False)   # income | expense
    amount      = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), default='')      # just description, no category
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    def to_dict(self):
        return {'id':self.id,'date':str(self.date),'type':self.type,'amount':self.amount,'description':self.description}

class Note(db.Model):
    __tablename__ = 'notes'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title      = db.Column(db.String(200))
    content    = db.Column(db.Text)
    type       = db.Column(db.String(20), default='diary')
    tags       = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    def to_dict(self):
        return {'id':self.id,'title':self.title,'content':self.content,'type':self.type,'tags':self.tags,'created_at':str(self.created_at)[:16]}
