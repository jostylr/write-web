# Discussion

Here we detail a simple implementation of a discussion board system. 

It should allow for boards, threads, replies, flagging, up/down votes, groups. There
should also be hooks for notifications (email, rss)

## Data

We need csv files for: 


!board.csv  name, [@thread], creator@user, @rating, date%:
!thread.csv description, @board, @user, file, @rating, [@group], date%:
!rating.csv file, id#, flags#, up#, down#
!user.csv @uid, [@groups], [@boards], [@threads], posts[[file, thread]], ratings[[file, id, type]]
!activity.csv @user, activity[file, id#, type, date%:]
thread#.csv content, @user, date%:, parent#, @rating


Board contains threads which contains 

