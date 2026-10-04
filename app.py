
import csv, os, sqlite3, shutil, datetime, tkinter as tk
from tkinter import ttk, filedialog, messagebox

APP_NAME = "CBHIRegistry — Shinile Woreda"
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cbhi_registry.db")
PHOTO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "photos")
os.makedirs(PHOTO_DIR, exist_ok=True)

def clean(v):
    return "" if v is None else str(v).strip()

def init_db():
    con = sqlite3.connect(DB_FILE)
    con.execute("""CREATE TABLE IF NOT EXISTS households(
        id INTEGER PRIMARY KEY, hh_code TEXT UNIQUE, head_name TEXT, fan_fin TEXT,
        kebele TEXT, sub_kebele TEXT, cluster TEXT, sub_phcu TEXT,
        category TEXT, status TEXT, rural_town TEXT, photo TEXT, created_at TEXT)""")
    con.execute("""CREATE TABLE IF NOT EXISTS members(
        id INTEGER PRIMARY KEY, hh_code TEXT, member_code TEXT, name TEXT,
        dob_day TEXT, dob_month TEXT, dob_year TEXT, sex TEXT, relationship TEXT,
        profession TEXT, kebele TEXT, gote TEXT, enrollment_date TEXT,
        category TEXT, rural_town TEXT, cbhi_card TEXT, fan_fin TEXT, photo TEXT,
        UNIQUE(hh_code, member_code))""")
    con.commit(); con.close()

def db():
    return sqlite3.connect(DB_FILE)

def import_csv(path):
    con = db(); cur = con.cursor()
    # The supplied Shinile file has metadata rows 0-9 and data from row 10.
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        rows=list(csv.reader(f))
    if len(rows) < 11:
        raise ValueError("CSV does not contain the expected CBHI structure.")
    current_hh=""
    current_kebele=""
    imported=0
    for row in rows[10:]:
        row += [""]*(18-len(row))
        if not clean(row[0]): continue
        name=clean(row[0])
        if clean(row[5]):
            current_hh=clean(row[5])
        if clean(row[7]):
            current_kebele=clean(row[7])
        member=clean(row[6])
        if not current_hh:
            # preserve rows without an HH ID as members with no household
            current_hh="UNASSIGNED"
        dob=f"{clean(row[1])}/{clean(row[2])}/{clean(row[3])}" if any(clean(x) for x in row[1:4]) else ""
        enrollment=f"{clean(row[11])}/{clean(row[12])}/{clean(row[13])}" if any(clean(x) for x in row[11:14]) else ""
        fan=clean(row[17])
        category=clean(row[14])
        rural=clean(row[15])
        # Household head rows have member code 00 and a household code.
        if member=="00" or clean(row[9]).lower()=="household head":
            try:
                cur.execute("""INSERT INTO households(hh_code,head_name,fan_fin,kebele,category,status,rural_town,created_at)
                    VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(hh_code) DO UPDATE SET
                    head_name=excluded.head_name, fan_fin=excluded.fan_fin, kebele=excluded.kebele,
                    category=excluded.category, rural_town=excluded.rural_town""",
                    (current_hh,name,fan,current_kebele,category,"Renewed" if category else "",rural,datetime.datetime.now().isoformat()))
            except sqlite3.Error:
                pass
        try:
            cur.execute("""INSERT INTO members(hh_code,member_code,name,dob_day,dob_month,dob_year,sex,relationship,
                profession,kebele,gote,enrollment_date,category,rural_town,cbhi_card,fan_fin)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(hh_code,member_code) DO UPDATE SET
                name=excluded.name, sex=excluded.sex, relationship=excluded.relationship,
                profession=excluded.profession,kebele=excluded.kebele,gote=excluded.gote,
                enrollment_date=excluded.enrollment_date,category=excluded.category,
                rural_town=excluded.rural_town,cbhi_card=excluded.cbhi_card,fan_fin=excluded.fan_fin""",
                (current_hh,member,name,clean(row[1]),clean(row[2]),clean(row[3]),clean(row[4]),
                 clean(row[9]),clean(row[10]),current_kebele,clean(row[8]),enrollment,category,rural,clean(row[16]),fan))
            imported+=1
        except sqlite3.Error:
            pass
    con.commit(); con.close()
    return imported

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_NAME); self.geometry("1200x760"); self.minsize(1000,650)
        init_db()
        self.create_ui()
        self.refresh_dashboard()

    def create_ui(self):
        style=ttk.Style(self)
        try: style.theme_use("clam")
        except: pass
        top=ttk.Frame(self,padding=10); top.pack(fill="x")
        ttk.Label(top,text=APP_NAME,font=("Segoe UI",18,"bold")).pack(side="left")
        ttk.Button(top,text="Import Excel/CSV",command=self.import_data).pack(side="right",padx=4)
        ttk.Button(top,text="Export CSV",command=self.export_csv).pack(side="right",padx=4)
        self.nb=ttk.Notebook(self); self.nb.pack(fill="both",expand=True,padx=10,pady=(0,10))
        self.dashboard_tab=ttk.Frame(self.nb); self.hh_tab=ttk.Frame(self.nb); self.search_tab=ttk.Frame(self.nb)
        self.data_tab=ttk.Frame(self.nb); self.loc_tab=ttk.Frame(self.nb); self.report_tab=ttk.Frame(self.nb)
        for tab,name in [(self.dashboard_tab,"Dashboard"),(self.hh_tab,"Household Registration"),
                         (self.search_tab,"Search"),(self.data_tab,"Data Management"),
                         (self.loc_tab,"Location Management"),(self.report_tab,"Reports")]:
            self.nb.add(tab,text=name)
        self.make_dashboard(); self.make_household(); self.make_search(); self.make_data(); self.make_locations(); self.make_reports()

    def make_dashboard(self):
        self.dvars={}
        f=ttk.Frame(self.dashboard_tab,padding=20); f.pack(fill="both",expand=True)
        cards=ttk.Frame(f); cards.pack(fill="x")
        for key,label in [("hh","Households"),("members","Members"),("higher","Higher"),("middle","Middle"),("lower","Lower"),("renewed","Renewed"),("unrenewed","Un-Renewed")]:
            box=ttk.LabelFrame(cards,text=label,padding=15); box.pack(side="left",fill="x",expand=True,padx=4)
            v=tk.StringVar(value="0"); self.dvars[key]=v
            ttk.Label(box,textvariable=v,font=("Segoe UI",20,"bold")).pack()
        sf=ttk.LabelFrame(f,text="Quick Search",padding=10); sf.pack(fill="x",pady=20)
        self.quick=tk.StringVar()
        e=ttk.Entry(sf,textvariable=self.quick); e.pack(side="left",fill="x",expand=True); e.bind("<Return>",lambda _:self.do_search(self.quick.get()))
        ttk.Button(sf,text="Search",command=lambda:self.do_search(self.quick.get())).pack(side="left",padx=6)
        ttk.Label(f,text="Offline local database • Data stays on this computer • Backup the cbhi_registry.db file",foreground="#555").pack(anchor="w")

    def make_household(self):
        f=ttk.Frame(self.hh_tab,padding=15); f.pack(fill="both",expand=True)
        left=ttk.LabelFrame(f,text="Household information",padding=12); left.pack(side="left",fill="y",padx=(0,10))
        self.fields={}
        labels=["HH CBHI Code","Household Head","FAN/FIN","Kebele","Sub-Kebele","Cluster","Sub-PHCU","Contribution Category","Membership Status","Rural/Town"]
        for i,l in enumerate(labels):
            ttk.Label(left,text=l).grid(row=i,column=0,sticky="w",pady=5)
            v=tk.StringVar(); self.fields[l]=v
            if l=="Contribution Category": w=ttk.Combobox(left,textvariable=v,values=["Higher","Middle","Lower"],state="readonly")
            elif l=="Membership Status": w=ttk.Combobox(left,textvariable=v,values=["Renewed","Un-Renewed"],state="readonly")
            elif l=="Rural/Town": w=ttk.Combobox(left,textvariable=v,values=["Rural","Town"],state="readonly")
            else: w=ttk.Entry(left,textvariable=v,width=30)
            w.grid(row=i,column=1,pady=5)
        ttk.Button(left,text="Save / Update Household",command=self.save_household).grid(row=10,column=0,columnspan=2,pady=12)
        ttk.Button(left,text="Clear",command=self.clear_hh).grid(row=11,column=0,columnspan=2)
        right=ttk.LabelFrame(f,text="Members in household",padding=10); right.pack(side="left",fill="both",expand=True)
        cols=("code","name","sex","relationship","profession","kebele","category")
        self.member_tree=ttk.Treeview(right,columns=cols,show="headings")
        for c,t in zip(cols,["Code","Name","Sex","Relationship","Profession","Kebele","Category"]):
            self.member_tree.heading(c,text=t); self.member_tree.column(c,width=100)
        self.member_tree.pack(fill="both",expand=True)
        bar=ttk.Frame(right); bar.pack(fill="x",pady=8)
        ttk.Button(bar,text="Load HH",command=self.load_members).pack(side="left")
        ttk.Button(bar,text="Add/Edit Member",command=self.member_dialog).pack(side="left",padx=5)
        ttk.Button(bar,text="Delete Member",command=self.delete_member).pack(side="left")

    def clear_hh(self):
        for v in self.fields.values(): v.set("")
        for x in self.member_tree.get_children(): self.member_tree.delete(x)

    def save_household(self):
        hh=self.fields["HH CBHI Code"].get().strip()
        if not hh: return messagebox.showerror("Required","HH CBHI Code is required.")
        con=db()
        con.execute("""INSERT INTO households(hh_code,head_name,fan_fin,kebele,sub_kebele,cluster,sub_phcu,category,status,rural_town,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(hh_code) DO UPDATE SET head_name=excluded.head_name,fan_fin=excluded.fan_fin,
        kebele=excluded.kebele,sub_kebele=excluded.sub_kebele,cluster=excluded.cluster,sub_phcu=excluded.sub_phcu,
        category=excluded.category,status=excluded.status,rural_town=excluded.rural_town""",
        (hh,self.fields["Household Head"].get(),self.fields["FAN/FIN"].get(),self.fields["Kebele"].get(),self.fields["Sub-Kebele"].get(),
         self.fields["Cluster"].get(),self.fields["Sub-PHCU"].get(),self.fields["Contribution Category"].get(),self.fields["Membership Status"].get(),
         self.fields["Rural/Town"].get(),datetime.datetime.now().isoformat()))
        con.commit(); con.close(); self.refresh_dashboard(); self.load_members(); messagebox.showinfo("Saved","Household saved.")

    def load_members(self):
        hh=self.fields["HH CBHI Code"].get().strip()
        for x in self.member_tree.get_children(): self.member_tree.delete(x)
        if not hh: return
        con=db(); rows=con.execute("SELECT member_code,name,sex,relationship,profession,kebele,category FROM members WHERE hh_code=? ORDER BY member_code",(hh,)).fetchall(); con.close()
        for r in rows: self.member_tree.insert("", "end", values=r)

    def member_dialog(self):
        hh=self.fields["HH CBHI Code"].get().strip()
        if not hh: return messagebox.showerror("Household required","Save or enter a HH CBHI Code first.")
        win=tk.Toplevel(self); win.title("Member Registration"); win.geometry("520x600")
        vals={}
        labels=["Member Code","Name","Sex","Relationship","Profession","Kebele","Gote","DOB Day","DOB Month","DOB Year","Enrollment Date","Category","Rural/Town","CBHI Card","FAN/FIN","Photo"]
        for i,l in enumerate(labels):
            ttk.Label(win,text=l).grid(row=i,column=0,sticky="w",padx=10,pady=4); v=tk.StringVar(); vals[l]=v
            if l=="Sex": w=ttk.Combobox(win,textvariable=v,values=["Male","Female"])
            elif l=="Category": w=ttk.Combobox(win,textvariable=v,values=["Higher","Middle","Lower"])
            elif l=="Rural/Town": w=ttk.Combobox(win,textvariable=v,values=["Rural","Town"])
            elif l=="CBHI Card": w=ttk.Combobox(win,textvariable=v,values=["Yes","No"])
            elif l=="Photo":
                w=ttk.Entry(win,textvariable=v,width=38); ttk.Button(win,text="Browse",command=lambda:v.set(filedialog.askopenfilename())).grid(row=i,column=2)
            else: w=ttk.Entry(win,textvariable=v,width=38)
            w.grid(row=i,column=1,padx=10,pady=4)
        sel=self.member_tree.selection()
        if sel:
            code=self.member_tree.item(sel[0],"values")[0]
            con=db(); r=con.execute("SELECT member_code,name,sex,relationship,profession,kebele,gote,dob_day,dob_month,dob_year,enrollment_date,category,rural_town,cbhi_card,fan_fin,photo FROM members WHERE hh_code=? AND member_code=?",(hh,code)).fetchone(); con.close()
            if r:
                for l,x in zip(labels,r): vals[l].set(x or "")
        def save():
            code=vals["Member Code"].get().strip()
            if not code: return messagebox.showerror("Required","Member Code is required.")
            con=db()
            con.execute("""INSERT INTO members(hh_code,member_code,name,sex,relationship,profession,kebele,gote,dob_day,dob_month,dob_year,enrollment_date,category,rural_town,cbhi_card,fan_fin,photo)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(hh_code,member_code) DO UPDATE SET name=excluded.name,sex=excluded.sex,relationship=excluded.relationship,
            profession=excluded.profession,kebele=excluded.kebele,gote=excluded.gote,dob_day=excluded.dob_day,dob_month=excluded.dob_month,dob_year=excluded.dob_year,
            enrollment_date=excluded.enrollment_date,category=excluded.category,rural_town=excluded.rural_town,cbhi_card=excluded.cbhi_card,fan_fin=excluded.fan_fin,photo=excluded.photo""",
            (hh,code,vals["Name"].get(),vals["Sex"].get(),vals["Relationship"].get(),vals["Profession"].get(),vals["Kebele"].get(),vals["Gote"].get(),
             vals["DOB Day"].get(),vals["DOB Month"].get(),vals["DOB Year"].get(),vals["Enrollment Date"].get(),vals["Category"].get(),vals["Rural/Town"].get(),
             vals["CBHI Card"].get(),vals["FAN/FIN"].get(),vals["Photo"].get()))
            con.commit(); con.close(); win.destroy(); self.load_members(); self.refresh_dashboard()
        ttk.Button(win,text="Save Member",command=save).grid(row=len(labels),column=0,columnspan=2,pady=12)

    def delete_member(self):
        sel=self.member_tree.selection()
        if not sel:return
        code=self.member_tree.item(sel[0],"values")[0]; hh=self.fields["HH CBHI Code"].get().strip()
        if messagebox.askyesno("Confirm","Delete member "+code+"?"):
            con=db(); con.execute("DELETE FROM members WHERE hh_code=? AND member_code=?",(hh,code)); con.commit(); con.close(); self.load_members(); self.refresh_dashboard()

    def make_search(self):
        f=ttk.Frame(self.search_tab,padding=12); f.pack(fill="both",expand=True)
        bar=ttk.Frame(f); bar.pack(fill="x")
        self.search_var=tk.StringVar(); ttk.Entry(bar,textvariable=self.search_var).pack(side="left",fill="x",expand=True)
        ttk.Button(bar,text="Search",command=lambda:self.do_search(self.search_var.get())).pack(side="left",padx=5)
        self.search_tree=ttk.Treeview(f,columns=("hh","code","name","sex","rel","kebele","category","fan"),show="headings")
        for c,t in zip(("hh","code","name","sex","rel","kebele","category","fan"),("HH Code","Member ID","Name","Sex","Relationship","Kebele","Category","FAN/FIN")):
            self.search_tree.heading(c,text=t); self.search_tree.column(c,width=120)
        self.search_tree.pack(fill="both",expand=True,pady=10)

    def do_search(self,q):
        if hasattr(self,"search_var"): self.search_var.set(q)
        q=clean(q)
        for x in self.search_tree.get_children(): self.search_tree.delete(x)
        con=db()
        if q:
            like="%"+q+"%"
            rows=con.execute("""SELECT hh_code,member_code,name,sex,relationship,kebele,category,fan_fin FROM members
            WHERE hh_code LIKE ? OR member_code LIKE ? OR name LIKE ? OR kebele LIKE ? OR fan_fin LIKE ? OR relationship LIKE ? ORDER BY hh_code,member_code LIMIT 2000""",
            (like,like,like,like,like,like)).fetchall()
        else: rows=[]
        con.close()
        for r in rows:self.search_tree.insert("", "end", values=r)
        self.nb.select(self.search_tab)

    def make_data(self):
        f=ttk.Frame(self.data_tab,padding=20); f.pack(fill="both",expand=True)
        ttk.Button(f,text="Import Excel/CSV database",command=self.import_data).pack(anchor="w",pady=8)
        ttk.Button(f,text="Export all members to CSV",command=self.export_csv).pack(anchor="w",pady=8)
        ttk.Button(f,text="Backup database",command=self.backup).pack(anchor="w",pady=8)
        ttk.Button(f,text="Restore database",command=self.restore).pack(anchor="w",pady=8)
        ttk.Button(f,text="Duplicate checking",command=self.duplicates).pack(anchor="w",pady=8)
        ttk.Label(f,text="Excel (.xlsx) import is supported when the Windows build includes openpyxl; CSV import works with the supplied Shinile 2018 structure.").pack(anchor="w",pady=15)

    def import_data(self):
        p=filedialog.askopenfilename(filetypes=[("CSV/Excel","*.csv *.xlsx"),("CSV","*.csv"),("Excel","*.xlsx")])
        if not p:return
        try:
            if p.lower().endswith(".csv"): n=import_csv(p)
            else:
                # Convert XLSX to CSV through openpyxl if available.
                try:
                    import openpyxl
                    wb=openpyxl.load_workbook(p,read_only=True,data_only=True); ws=wb.active
                    tmp=os.path.join(os.path.dirname(DB_FILE),"_import_tmp.csv")
                    with open(tmp,"w",encoding="utf-8",newline="") as f:
                        csv.writer(f).writerows(ws.iter_rows(values_only=True))
                    n=import_csv(tmp); os.remove(tmp)
                except ImportError: raise RuntimeError("Excel import requires openpyxl in this build.")
            self.refresh_dashboard(); messagebox.showinfo("Import complete",f"Imported/updated {n:,} member rows.")
        except Exception as e: messagebox.showerror("Import failed",str(e))

    def export_csv(self):
        p=filedialog.asksaveasfilename(defaultextension=".csv",initialfile="CBHIRegistry_Export.csv",filetypes=[("CSV","*.csv")])
        if not p:return
        con=db(); rows=con.execute("""SELECT m.hh_code,m.member_code,m.name,m.dob_day,m.dob_month,m.dob_year,m.sex,m.relationship,
        m.profession,m.kebele,m.gote,m.enrollment_date,m.category,m.rural_town,m.cbhi_card,m.fan_fin,h.head_name
        FROM members m LEFT JOIN households h ON h.hh_code=m.hh_code ORDER BY m.hh_code,m.member_code""").fetchall(); con.close()
        with open(p,"w",encoding="utf-8-sig",newline="") as f:
            w=csv.writer(f); w.writerow(["HH CBHI Code","Beneficiary CBHI ID","Full Name","DOB Day","DOB Month","DOB Year","Gender","Relationship","Profession","Kebele","Gote","Enrollment Date","Sliding Scale Category","Rural/Town","Has CBHI ID Card","FAN/FIN","Household Head"])
            w.writerows(rows)
        messagebox.showinfo("Export complete",f"Exported {len(rows):,} members.")

    def backup(self):
        p=filedialog.asksaveasfilename(defaultextension=".db",initialfile="CBHIRegistry_Backup.db")
        if p: shutil.copy2(DB_FILE,p); messagebox.showinfo("Backup","Backup saved.")

    def restore(self):
        p=filedialog.askopenfilename(filetypes=[("Database","*.db")])
        if p and messagebox.askyesno("Restore","Replace the current database with this backup?"):
            shutil.copy2(p,DB_FILE); self.refresh_dashboard(); messagebox.showinfo("Restore","Database restored.")

    def duplicates(self):
        con=db()
        rows=con.execute("""SELECT hh_code,member_code,COUNT(*) c FROM members GROUP BY hh_code,member_code HAVING c>1""").fetchall()
        # Unique constraint prevents normal duplicates; also report repeated FAN/FIN where non-empty.
        fan=con.execute("""SELECT fan_fin,COUNT(*) c FROM members WHERE trim(coalesce(fan_fin,''))<>'' GROUP BY fan_fin HAVING c>1 ORDER BY c DESC LIMIT 100""").fetchall()
        con.close()
        messagebox.showinfo("Duplicate checking",f"Duplicate HH+member IDs: {len(rows)}\nRepeated FAN/FIN values: {len(fan)}")

    def make_locations(self):
        f=ttk.Frame(self.loc_tab,padding=15); f.pack(fill="both",expand=True)
        ttk.Label(f,text="Location hierarchy can be maintained through household fields: Kebele → Sub-Kebele, Cluster, Sub-PHCU.").pack(anchor="w")
        self.loc_tree=ttk.Treeview(f,columns=("kebele","households","members"),show="headings")
        for c,t in zip(("kebele","households","members"),("Kebele","Households","Members")): self.loc_tree.heading(c,text=t)
        self.loc_tree.pack(fill="both",expand=True,pady=12)
        ttk.Button(f,text="Refresh",command=self.refresh_locations).pack(anchor="w")
        self.refresh_locations()

    def refresh_locations(self):
        if not hasattr(self,"loc_tree"): return
        for x in self.loc_tree.get_children(): self.loc_tree.delete(x)
        con=db(); rows=con.execute("""SELECT kebele,COUNT(DISTINCT hh_code),COUNT(*) FROM members WHERE trim(coalesce(kebele,''))<>'' GROUP BY kebele ORDER BY kebele""").fetchall(); con.close()
        for r in rows:self.loc_tree.insert("", "end", values=r)

    def make_reports(self):
        f=ttk.Frame(self.report_tab,padding=15); f.pack(fill="both",expand=True)
        self.report_text=tk.Text(f,font=("Consolas",11)); self.report_text.pack(fill="both",expand=True)
        ttk.Button(f,text="Refresh Reports",command=self.refresh_reports).pack(anchor="w",pady=8)
        self.refresh_reports()

    def refresh_reports(self):
        con=db()
        hh=con.execute("SELECT COUNT(*) FROM households").fetchone()[0]
        mem=con.execute("SELECT COUNT(*) FROM members").fetchone()[0]
        cats=con.execute("SELECT COALESCE(NULLIF(category,''),'Missing'),COUNT(*) FROM members GROUP BY category ORDER BY category").fetchall()
        keb=con.execute("SELECT COALESCE(NULLIF(kebele,''),'Missing'),COUNT(DISTINCT hh_code),COUNT(*) FROM members GROUP BY kebele ORDER BY kebele").fetchall()
        con.close()
        self.report_text.delete("1.0","end")
        self.report_text.insert("end",f"CBHIRegistry — Shinile Woreda Reports\n{'='*55}\nHouseholds: {hh:,}\nMembers: {mem:,}\n\nContribution categories:\n")
        for a,b in cats:self.report_text.insert("end",f"  {a}: {b:,}\n")
        self.report_text.insert("end","\nKebele report:\n")
        for a,b,c in keb:self.report_text.insert("end",f"  {a:20} HH {b:6,}  Members {c:7,}\n")

    def refresh_dashboard(self):
        con=db()
        vals={
            "hh":con.execute("SELECT COUNT(*) FROM households").fetchone()[0],
            "members":con.execute("SELECT COUNT(*) FROM members").fetchone()[0],
            "higher":con.execute("SELECT COUNT(*) FROM members WHERE category='Higher'").fetchone()[0],
            "middle":con.execute("SELECT COUNT(*) FROM members WHERE category='Middle'").fetchone()[0],
            "lower":con.execute("SELECT COUNT(*) FROM members WHERE category='Lower'").fetchone()[0],
            "renewed":con.execute("SELECT COUNT(*) FROM households WHERE status='Renewed'").fetchone()[0],
            "unrenewed":con.execute("SELECT COUNT(*) FROM households WHERE status='Un-Renewed'").fetchone()[0]}
        con.close()
        for k,v in vals.items():
            if k in self.dvars:self.dvars[k].set(f"{v:,}")
        if hasattr(self,"loc_tree"): self.refresh_locations()
        if hasattr(self,"report_text"): self.refresh_reports()

if __name__=="__main__":
    App().mainloop()
