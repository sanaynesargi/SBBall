yarn build
rsync -avz --info=progress2 -e  "ssh -i ~/.ssh/NBAServer.pem" .next/ ubuntu@ec2-44-226-227-51.us-west-2.compute.amazonaws.com:/home/ubuntu/SBBall/sbball-ui/.next