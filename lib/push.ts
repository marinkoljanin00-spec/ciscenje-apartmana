import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(subscription: webpush.PushSubscription, title: string, body: string, url: string = '/') {
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
  } catch (error) {
    console.error('Push error:', error);
  }
}
