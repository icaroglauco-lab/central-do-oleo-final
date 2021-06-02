export const doPost = ({content, include_player_ids}) => {
  let body = JSON.stringify({
    ...content,
    app_id: "686430d5-b7be-47a4-a6a1-ec8c8ddaba33",
    include_player_ids: include_player_ids
  }) ;
  
  const res = fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers : new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic ZWMzYWFlYTEtNDAxZi00MGI5LThlNzUtNmRhM2VkNTgyMWUw",
    }),
    body
  });

}