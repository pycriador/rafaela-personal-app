"""Conservative registration of exercise frames, preserving the original poses.

Always stages media first. Application is a separate, hash-guarded action.
"""
from pathlib import Path
import sys,json,hashlib,math,argparse
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.image-sequence-runtime'))
import cv2
import numpy as np
from PIL import Image,ImageDraw

DATA=Path(__file__).resolve().parent
BACKUP=ROOT/'backups/exercises-before-sequencing-20260922-234724'
SOURCE=BACKUP/'exercises'
STAGE=ROOT/'backups/all-exercise-sequences'
def kind(p):
    slug=p['slug']
    if p['mode'] in ('approved','hold'):return p['mode']
    if any(s in slug for s in ['pull-up','chin-up','active-hang']):return 'hang'
    if 'push-up' in slug and not any(s in slug for s in ['handstand','hindu','pike']):return 'pushup'
    if slug in ('dip','chest-dip','weighted-dip','assisted-dip','bench-dip'):return 'dip'
    if 'squat' in slug and not any(s in slug for s in ['thrust','pistol','sissy','shrimp','skater']):return 'squat'
    if any(s in slug for s in ['deadlift','good-morning','back-extension','pull-through']):return 'hinge'
    if 'leg-curl' in slug or slug in ('towel-hamstring-curl','stability-ball-hamstring-curl'):return 'knee'
    if any(s in slug for s in ['leg-raise','knee-raise','donkey-kick','fire-hydrant','kickback','hip-abduction','hip-adduction','clamshell']) and p['primary_muscle']!='Triceps':return 'legs'
    if any(s in slug for s in ['crunch','sit-up','toe-touch','v-up']):return 'trunk'
    if p['primary_muscle'] in ('Chest','Shoulders','Rear Delts','Back','Lats','Biceps','Triceps','Forearms','Upper Back') and p['equipment']!='Cardio' and not p['is_stretch']:
        return 'arms'
    return 'pose'


def rgb(alpha):
    im=Image.new('RGBA',(512,512),'white');im.putalpha(Image.fromarray(np.clip(alpha,0,255).astype(np.uint8)));return im


def static_regions(reference,others):
    """Lock only locally matching, low-motion regions; never cut limb layers."""
    ref=cv2.GaussianBlur(reference,(0,0),2)
    match=np.ones((512,512),np.uint8)*255
    engine=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    for other in others:
        target=cv2.GaussianBlur(other,(0,0),2)
        flow=engine.calc(ref,target,None)
        magnitude=np.linalg.norm(cv2.GaussianBlur(flow,(0,0),4),axis=2)
        difference=cv2.GaussianBlur(np.abs(ref.astype(float)-target.astype(float)).astype(np.float32),(0,0),7)
        local_ink=cv2.GaussianBlur(np.maximum(ref,target).astype(np.float32),(0,0),7)
        stable=(magnitude<5)&(difference<np.maximum(2,local_ink*.42))
        match=np.minimum(match,stable.astype(np.uint8)*255)
    match=cv2.morphologyEx(match,cv2.MORPH_OPEN,np.ones((15,15),np.uint8))
    match=cv2.erode(match,np.ones((7,7),np.uint8))
    return cv2.GaussianBlur(match,(0,0),1.5).astype(float)/255


def image_camera(reference,target,mode):
    roi=np.zeros((512,512),np.uint8)
    if mode=='hang':roi[:170]=255
    elif mode in ('legs','knee'):roi[:270]=255
    elif mode=='arms':roi[255:]=255
    else:roi[335:]=255
    sift=cv2.SIFT_create(1200,contrastThreshold=.008,edgeThreshold=15)
    a,da=sift.detectAndCompute(reference,roi);b,db=sift.detectAndCompute(target,roi)
    identity=np.array([[1,0,0],[0,1,0]],np.float32)
    if da is None or db is None or min(len(a),len(b))<6:return identity,0
    pairs=cv2.BFMatcher().knnMatch(db,da,k=2)
    matches=[m for pair in pairs if len(pair)==2 for m,n in [pair] if m.distance<.7*n.distance]
    if len(matches)<6:return identity,len(matches)
    source=np.float32([b[m.queryIdx].pt for m in matches]);dest=np.float32([a[m.trainIdx].pt for m in matches])
    matrix,inliers=cv2.estimateAffinePartial2D(source,dest,method=cv2.RANSAC,ransacReprojThreshold=2.5,maxIters=3000)
    count=int(inliers.sum()) if inliers is not None else 0
    if matrix is None or count<6 or count/len(matches)<.45:return identity,count
    scale=float(np.linalg.norm(matrix[0,:2]));angle=math.degrees(math.atan2(matrix[1,0],matrix[0,0]))
    if not .9<=scale<=1.1 or abs(angle)>3 or np.max(np.abs(matrix[:,2]))>40:return identity,count
    return matrix.astype(np.float32),count


def render_rig(p,arrays):
    mode=kind(p)
    if mode=='approved':return arrays,{'mode':'approved','reference':None,'issues':[]}
    ref=0
    aligned=[];matrices=[]
    for i,a in enumerate(arrays):
        matrix,inliers=image_camera(arrays[0],a,mode) if i!=ref else (np.array([[1,0,0],[0,1,0]],np.float32),0)
        candidate=cv2.warpAffine(a,matrix,(512,512),flags=cv2.INTER_CUBIC)
        # All input strokes must stay inside the image before a common framing.
        total=float(a.sum())*float(matrix[0,0])**2
        if candidate.sum()<total*.98:
            matrix=np.array([[1,0,0],[0,1,0]],np.float32);candidate=a.copy()
        aligned.append(candidate);matrices.append(matrix)
    # A single final crop/margin operation for the whole sequence.
    union=np.maximum.reduce(aligned)
    y,x=np.nonzero(union>32)
    bounds=[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
    if min(bounds[:2])<26 or max(bounds[2:])>486:
        x0,y0,x1,y1=bounds;s=min(1,448/max(x1-x0,y1-y0))
        common=np.array([[s,0,256-s*(x0+x1)/2],[0,s,256-s*(y0+y1)/2]],np.float32)
        aligned=[cv2.warpAffine(a,common,(512,512),flags=cv2.INTER_CUBIC) for a in aligned]
    else:common=np.array([[1,0,0],[0,1,0]],np.float32)
    locked=static_regions(aligned[0],aligned[1:])
    frames=[aligned[0]]+[np.clip(a*(1-locked)+aligned[0]*locked,0,255).astype(np.uint8) for a in aligned[1:]]
    issues=[]
    return frames,{'mode':'stabilized-original-poses','family':mode,'reference':1,
                   'issues':issues,'camera_matrices':[m.tolist() for m in matrices],
                   'common_framing':common.tolist(),'locked_pixel_fraction':float((locked>.99).mean()),
                   'geometry':'uniform scale, rotation and translation; original poses preserved'}


def run_one(slug,profiles):
    p=profiles[slug];arrays=[]
    for i,record in enumerate(p['frames'],1):
        path=SOURCE/'frames'/slug/f'frame-{i}.png'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==record['sha256'],f'Source changed: {path}'
        arrays.append(np.asarray(Image.open(path).convert('RGBA'))[:,:,3].copy())
    frames,report=render_rig(p,arrays)
    directory=STAGE/'candidate'/slug;directory.mkdir(parents=True,exist_ok=True)
    for i,a in enumerate(frames,1):rgb(a).save(directory/f'frame-{i}.png')
    report['slug']=slug
    (directory/'report.json').write_text(json.dumps(report,indent=2))
    preview=[]
    for i in (0,1,2,1):
        bg=Image.new('RGB',(512,512),'#273741');im=rgb(frames[i]);bg.paste(im,(0,0),im);preview.append(bg)
    preview[0].save(directory/'sequence.gif',save_all=True,append_images=preview[1:],duration=650,loop=0)
    return report


def main():
    global BACKUP,SOURCE,STAGE
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slugs',nargs='*')
    parser.add_argument('--backup',type=Path,default=BACKUP)
    parser.add_argument('--output',type=Path,default=STAGE)
    args=parser.parse_args();cv2.setNumThreads(2)
    BACKUP=args.backup.resolve();SOURCE=BACKUP/'exercises';STAGE=args.output.resolve()
    profiles=json.loads((DATA/'profiles.json').read_text())
    slugs=args.slugs or list(profiles)
    unknown=set(slugs)-set(profiles)
    if unknown:parser.error('Unknown exercises: '+', '.join(sorted(unknown)))
    reports=[]
    for i,slug in enumerate(slugs,1):
        reports.append(run_one(slug,profiles))
        if i%10==0 or len(slugs)<10:print(f'{i}/{len(slugs)} {slug}: {reports[-1]["issues"]}',flush=True)
    (STAGE/'candidate-report.json').write_text(json.dumps(reports,indent=2))
    rows=(len(slugs)+3)//4
    if len(slugs)<=24:
        sheet=Image.new('RGB',(6*192,len(slugs)*218),'#273741');d=ImageDraw.Draw(sheet)
        for row,slug in enumerate(slugs):
            d.text((4,row*218),slug+' | before -> candidate',fill='white')
            for c in range(6):
                path=(SOURCE/'frames'/slug if c<3 else STAGE/'candidate'/slug)/f'frame-{c%3+1}.png'
                im=Image.open(path).resize((190,190));sheet.paste(im,(c*192,row*218+24),im)
        sheet.save(STAGE/'candidate-comparison.jpg',quality=92)
    print('Candidates staged, not applied.',flush=True)


if __name__=='__main__':main()
