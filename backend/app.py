from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, MoodEntry, Habit, HabitLog, Goal, HealthLog, FinanceEntry, Note, PillarScore
from datetime import date, timedelta, datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lifeup.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'lifeup-secret-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

CORS(app, resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type","Authorization"],
     methods=["GET","POST","PUT","DELETE","OPTIONS"])

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

def ok(data=None, msg='success', code=200):
    return jsonify({'success':True,'message':msg,'data':data}), code

def err(msg='error', code=400):
    return jsonify({'success':False,'message':msg}), code

def guser(uid):
    return db.session.get(User, int(uid))

DEFAULT_PILLARS = [
    {'label':'Health',     'color':'#22c55e','icon':'🫀'},
    {'label':'Mind',       'color':'#a78bfa','icon':'🧠'},
    {'label':'Wealth',     'color':'#f59e0b','icon':'💰'},
    {'label':'Career',     'color':'#3b82f6','icon':'💼'},
    {'label':'Growth',     'color':'#f472b6','icon':'🌱'},
    {'label':'Discipline', 'color':'#fb923c','icon':'🎯'},
    {'label':'Relations',  'color':'#14b8a6','icon':'🤝'},
    {'label':'Happiness',  'color':'#facc15','icon':'😊'},
]

def seed_pillars(user_id):
    for p in DEFAULT_PILLARS:
        exists = PillarScore.query.filter_by(user_id=user_id, label=p['label']).first()
        if not exists:
            ps = PillarScore(user_id=user_id, label=p['label'], score=50, color=p['color'], icon=p['icon'])
            db.session.add(ps)
    db.session.commit()

# ── OPTIONS preflight ────────────────────────────────
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        resp = jsonify({'ok':True})
        resp.headers['Access-Control-Allow-Origin']  = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        return resp, 200

# ── AUTH ─────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.get_json(force=True) or {}
    if not d.get('name') or not d.get('email') or not d.get('password'):
        return err('Name, email and password required')
    if User.query.filter_by(email=d['email'].lower().strip()).first():
        return err('Email already registered')
    user = User(name=d['name'].strip(), email=d['email'].lower().strip(),
                password_hash=generate_password_hash(d['password']), avatar=d.get('avatar','🌿'))
    db.session.add(user); db.session.commit()
    seed_pillars(user.id)
    defaults = [
        Habit(user_id=user.id, name='Wake Up Early',  icon='🌅', category='health', color='#f59e0b'),
        Habit(user_id=user.id, name='Drink 3L Water', icon='💧', category='health', color='#3b82f6'),
        Habit(user_id=user.id, name='Workout',        icon='🏋️', category='health', color='#22c55e'),
        Habit(user_id=user.id, name='Read 30 mins',   icon='📚', category='mind',   color='#8b5cf6'),
        Habit(user_id=user.id, name='Meditate',       icon='🧘', category='mind',   color='#ec4899'),
        Habit(user_id=user.id, name='Track Expenses', icon='💰', category='wealth', color='#f59e0b'),
    ]
    db.session.add_all(defaults); db.session.commit()
    token = create_access_token(identity=str(user.id))
    return ok({'token':token,'user':user.to_dict()}, 'Registered', 201)

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.get_json(force=True) or {}
    user = User.query.filter_by(email=d.get('email','').lower().strip()).first()
    if not user or not check_password_hash(user.password_hash, d.get('password','')):
        return err('Invalid email or password', 401)
    token = create_access_token(identity=str(user.id))
    return ok({'token':token,'user':user.to_dict()})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    user = guser(get_jwt_identity())
    if not user: return err('Not found', 404)
    return ok(user.to_dict())

@app.route('/api/auth/update', methods=['PUT'])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    user = guser(uid)
    if not user: return err('Not found', 404)
    d = request.get_json(force=True) or {}
    if 'name'   in d: user.name   = d['name'].strip()
    if 'avatar' in d: user.avatar = d['avatar']
    if d.get('password'): user.password_hash = generate_password_hash(d['password'])
    db.session.commit()
    return ok(user.to_dict())

# ── PILLARS ──────────────────────────────────────────
@app.route('/api/pillars', methods=['GET'])
@jwt_required()
def get_pillars():
    uid = int(get_jwt_identity())
    pillars = PillarScore.query.filter_by(user_id=uid).all()
    if not pillars:
        seed_pillars(uid)
        pillars = PillarScore.query.filter_by(user_id=uid).all()
    return ok([p.to_dict() for p in pillars])

@app.route('/api/pillars/<int:pid>', methods=['PUT'])
@jwt_required()
def update_pillar(pid):
    uid = int(get_jwt_identity())
    p = PillarScore.query.filter_by(id=pid, user_id=uid).first()
    if not p: return err('Not found', 404)
    d = request.get_json(force=True) or {}
    if 'score' in d: p.score = max(0, min(100, int(d['score'])))
    db.session.commit()
    # Recalculate life score (avg of all pillars) → store as XP proxy
    all_pillars = PillarScore.query.filter_by(user_id=uid).all()
    avg = round(sum(x.score for x in all_pillars) / len(all_pillars))
    user = guser(uid); user.xp = avg  # reuse xp field as life_score for simplicity
    db.session.commit()
    return ok(p.to_dict())

# ── DASHBOARD ────────────────────────────────────────
@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    uid = int(get_jwt_identity())
    today     = date.today()
    week_ago  = today - timedelta(days=6)
    month_start = today.replace(day=1)
    health_log = HealthLog.query.filter_by(user_id=uid, date=today).first()
    mood       = MoodEntry.query.filter_by(user_id=uid, date=today).first()
    habits     = Habit.query.filter_by(user_id=uid).all()
    logs_today = HabitLog.query.filter_by(user_id=uid, date=today).all()
    done_ids   = {l.habit_id for l in logs_today if l.completed}
    mood_week  = MoodEntry.query.filter(MoodEntry.user_id==uid, MoodEntry.date>=week_ago).order_by(MoodEntry.date).all()
    fin        = FinanceEntry.query.filter(FinanceEntry.user_id==uid, FinanceEntry.date>=month_start).all()
    income     = sum(f.amount for f in fin if f.type=='income')
    expenses   = sum(f.amount for f in fin if f.type=='expense')
    goals      = Goal.query.filter_by(user_id=uid, completed=False).order_by(Goal.created_at.desc()).limit(5).all()
    pillars    = PillarScore.query.filter_by(user_id=uid).all()
    if not pillars:
        seed_pillars(uid)
        pillars = PillarScore.query.filter_by(user_id=uid).all()
    life_score = round(sum(p.score for p in pillars)/len(pillars)) if pillars else 50
    user = guser(uid)
    return ok({
        'user': user.to_dict(),
        'life_score': life_score,
        'pillars': [p.to_dict() for p in pillars],
        'today': {
            'steps': health_log.steps if health_log else 0,
            'water': health_log.water_glasses if health_log else 0,
            'sleep': health_log.sleep_hours if health_log else 0,
            'calories': health_log.calories if health_log else 0,
            'workout_mins': health_log.workout_mins if health_log else 0,
        },
        'mood': mood.to_dict() if mood else None,
        'habits': {'done':len(done_ids),'total':len(habits)},
        'finance': {'income':income,'expenses':expenses,'savings':income-expenses},
        'mood_week': [m.to_dict() for m in mood_week],
        'goals': [g.to_dict() for g in goals],
    })

# ── MOOD ─────────────────────────────────────────────
@app.route('/api/mood', methods=['GET'])
@jwt_required()
def get_moods():
    uid   = int(get_jwt_identity())
    days  = int(request.args.get('days', 30))
    since = date.today() - timedelta(days=days)
    entries = MoodEntry.query.filter(MoodEntry.user_id==uid, MoodEntry.date>=since).order_by(MoodEntry.date.desc()).all()
    return ok([e.to_dict() for e in entries])

@app.route('/api/mood', methods=['POST'])
@jwt_required()
def save_mood():
    uid   = int(get_jwt_identity())
    d     = request.get_json(force=True) or {}
    today = date.today()
    labels = {1:'😔 Low',2:'😕 Meh',3:'😊 Good',4:'😄 Great',5:'🤩 Amazing'}
    existing = MoodEntry.query.filter_by(user_id=uid, date=today).first()
    if existing:
        existing.mood       = d.get('mood', existing.mood)
        existing.mood_label = labels.get(existing.mood,'')
        existing.energy     = d.get('energy', existing.energy)
        existing.journal    = d.get('journal', existing.journal)
        existing.tags       = d.get('tags', existing.tags)
        db.session.commit()
        return ok(existing.to_dict(), 'Updated')
    entry = MoodEntry(user_id=uid, mood=d.get('mood',3), mood_label=labels.get(d.get('mood',3),''),
                      energy=d.get('energy',5), journal=d.get('journal',''), tags=d.get('tags',''))
    db.session.add(entry)
    user = guser(uid); user.xp = (user.xp or 0) + 10
    db.session.commit()
    return ok(entry.to_dict(), 'Saved', 201)

# ── HABITS ───────────────────────────────────────────
@app.route('/api/habits', methods=['GET'])
@jwt_required()
def get_habits():
    uid    = int(get_jwt_identity())
    habits = Habit.query.filter_by(user_id=uid).all()
    today  = date.today(); week_ago = today - timedelta(days=6)
    result = []
    for h in habits:
        logs    = HabitLog.query.filter(HabitLog.habit_id==h.id, HabitLog.date>=week_ago).all()
        log_map = {str(l.date): l.completed for l in logs}
        week    = [(today - timedelta(days=6-i)) for i in range(7)]
        days_done = [log_map.get(str(d), False) for d in week]
        streak = 0; check = today
        while True:
            l = HabitLog.query.filter_by(habit_id=h.id, date=check, completed=True).first()
            if l: streak += 1; check -= timedelta(days=1)
            else: break
        today_log = HabitLog.query.filter_by(habit_id=h.id, date=today).first()
        row = h.to_dict(); row['streak']=streak; row['week']=days_done
        row['done_today'] = today_log.completed if today_log else False
        result.append(row)
    return ok(result)

@app.route('/api/habits', methods=['POST'])
@jwt_required()
def add_habit():
    uid   = int(get_jwt_identity())
    d     = request.get_json(force=True) or {}
    habit = Habit(user_id=uid, name=d.get('name','New Habit'), icon=d.get('icon','✅'),
                  category=d.get('category','health'), color=d.get('color','#7c3aed'), target_days=d.get('target_days',7))
    db.session.add(habit); db.session.commit()
    return ok(habit.to_dict(), 'Created', 201)

@app.route('/api/habits/<int:hid>', methods=['DELETE'])
@jwt_required()
def delete_habit(hid):
    uid   = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=hid, user_id=uid).first()
    if not habit: return err('Not found', 404)
    db.session.delete(habit); db.session.commit()
    return ok(msg='Deleted')

@app.route('/api/habits/<int:hid>/toggle', methods=['POST'])
@jwt_required()
def toggle_habit(hid):
    uid   = int(get_jwt_identity())
    today = date.today()
    log   = HabitLog.query.filter_by(habit_id=hid, user_id=uid, date=today).first()
    if log: log.completed = not log.completed
    else:
        log = HabitLog(habit_id=hid, user_id=uid, date=today, completed=True)
        db.session.add(log)
    if log.completed:
        user = guser(uid); user.xp = (user.xp or 0) + 5
    db.session.commit()
    return ok({'completed': log.completed})

# ── GOALS ────────────────────────────────────────────
@app.route('/api/goals', methods=['GET'])
@jwt_required()
def get_goals():
    uid   = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=uid).order_by(Goal.created_at.desc()).all()
    return ok([g.to_dict() for g in goals])

@app.route('/api/goals', methods=['POST'])
@jwt_required()
def add_goal():
    uid = int(get_jwt_identity())
    d   = request.get_json(force=True) or {}
    td  = None
    if d.get('target_date'):
        try: td = datetime.strptime(d['target_date'], '%Y-%m-%d').date()
        except: pass
    goal = Goal(user_id=uid, title=d.get('title','New Goal'), category=d.get('category','personal'),
                color=d.get('color','#7c3aed'), icon=d.get('icon','🎯'), target_date=td)
    db.session.add(goal); db.session.commit()
    return ok(goal.to_dict(), 'Added', 201)

@app.route('/api/goals/<int:gid>', methods=['PUT'])
@jwt_required()
def update_goal(gid):
    uid  = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=gid, user_id=uid).first()
    if not goal: return err('Not found', 404)
    d = request.get_json(force=True) or {}
    if 'progress'  in d: goal.progress  = max(0, min(100, int(d['progress'])))
    if 'title'     in d: goal.title     = d['title']
    if 'completed' in d:
        goal.completed = bool(d['completed'])
        if goal.completed:
            user = guser(uid); user.xp = (user.xp or 0) + 50
    db.session.commit()
    return ok(goal.to_dict())

@app.route('/api/goals/<int:gid>', methods=['DELETE'])
@jwt_required()
def delete_goal(gid):
    uid  = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=gid, user_id=uid).first()
    if not goal: return err('Not found', 404)
    db.session.delete(goal); db.session.commit()
    return ok(msg='Deleted')

# ── HEALTH ───────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
@jwt_required()
def get_health():
    uid   = int(get_jwt_identity())
    days  = int(request.args.get('days', 7))
    since = date.today() - timedelta(days=days)
    logs  = HealthLog.query.filter(HealthLog.user_id==uid, HealthLog.date>=since).order_by(HealthLog.date.desc()).all()
    return ok([l.to_dict() for l in logs])

@app.route('/api/health', methods=['POST'])
@jwt_required()
def save_health():
    uid = int(get_jwt_identity())
    d   = request.get_json(force=True) or {}
    log = HealthLog.query.filter_by(user_id=uid, date=date.today()).first()
    if not log:
        log = HealthLog(user_id=uid); db.session.add(log)
    for f in ['steps','water_glasses','sleep_hours','calories','weight_kg','heart_rate','bp_systolic','bp_diastolic','workout_mins']:
        if f in d: setattr(log, f, d[f])
    db.session.commit()
    return ok(log.to_dict())

# ── FINANCE ──────────────────────────────────────────
@app.route('/api/finance', methods=['GET'])
@jwt_required()
def get_finance():
    uid     = int(get_jwt_identity())
    days    = int(request.args.get('days', 30))
    since   = date.today() - timedelta(days=days)
    entries = FinanceEntry.query.filter(FinanceEntry.user_id==uid, FinanceEntry.date>=since).order_by(FinanceEntry.date.desc()).all()
    income   = sum(e.amount for e in entries if e.type=='income')
    expenses = sum(e.amount for e in entries if e.type=='expense')
    savings  = income - expenses
    rate     = round(savings/income*100) if income else 0
    return ok({'entries':[e.to_dict() for e in entries],
               'summary':{'income':income,'expenses':expenses,'savings':savings,'savings_rate':rate}})

@app.route('/api/finance', methods=['POST'])
@jwt_required()
def add_finance():
    uid = int(get_jwt_identity())
    d   = request.get_json(force=True) or {}
    if not d.get('amount') or float(d.get('amount',0)) <= 0:
        return err('Enter a valid amount')
    entry = FinanceEntry(user_id=uid, type=d.get('type','expense'),
                         amount=float(d['amount']), description=d.get('description',''))
    db.session.add(entry); db.session.commit()
    return ok(entry.to_dict(), 'Saved', 201)

@app.route('/api/finance/<int:eid>', methods=['DELETE'])
@jwt_required()
def delete_finance(eid):
    uid = int(get_jwt_identity())
    e   = FinanceEntry.query.filter_by(id=eid, user_id=uid).first()
    if not e: return err('Not found', 404)
    db.session.delete(e); db.session.commit()
    return ok(msg='Deleted')

# ── NOTES ────────────────────────────────────────────
@app.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    uid   = int(get_jwt_identity())
    ntype = request.args.get('type')
    q     = Note.query.filter_by(user_id=uid)
    if ntype: q = q.filter_by(type=ntype)
    return ok([n.to_dict() for n in q.order_by(Note.created_at.desc()).all()])

@app.route('/api/notes', methods=['POST'])
@jwt_required()
def add_note():
    uid  = int(get_jwt_identity())
    d    = request.get_json(force=True) or {}
    note = Note(user_id=uid, title=d.get('title',''), content=d.get('content',''),
                type=d.get('type','diary'), tags=d.get('tags',''))
    db.session.add(note); db.session.commit()
    return ok(note.to_dict(), 'Saved', 201)

@app.route('/api/notes/<int:nid>', methods=['PUT'])
@jwt_required()
def update_note(nid):
    uid  = int(get_jwt_identity())
    note = Note.query.filter_by(id=nid, user_id=uid).first()
    if not note: return err('Not found', 404)
    d = request.get_json(force=True) or {}
    for f in ['title','content','type','tags']:
        if f in d: setattr(note, f, d[f])
    db.session.commit()
    return ok(note.to_dict())

@app.route('/api/notes/<int:nid>', methods=['DELETE'])
@jwt_required()
def delete_note(nid):
    uid  = int(get_jwt_identity())
    note = Note.query.filter_by(id=nid, user_id=uid).first()
    if not note: return err('Not found', 404)
    db.session.delete(note); db.session.commit()
    return ok(msg='Deleted')

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
