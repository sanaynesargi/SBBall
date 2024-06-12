yarn build
rsync -avz --info=progress2 -e  "ssh -i ~/.ssh/fm-server.pem" .next/ ubuntu@ec2-3-86-198-164.compute-1.amazonaws.com:/home/ubuntu/SBBall/sbball-ui/.next