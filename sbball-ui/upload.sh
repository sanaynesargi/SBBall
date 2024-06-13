yarn build
rsync -avz --info=progress2 -e  "ssh -i ~/.ssh/fm-server.pem" .next/ ubuntu@ec2-54-144-179-206.compute-1.amazonaws.com:/home/ubuntu/SBBall/sbball-ui/.next