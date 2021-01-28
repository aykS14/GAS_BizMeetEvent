/*《リソース→ライブラリ》Momentsプロジェクトキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48*/
//　doGet():GETリクエストがきたら、index.htmlを返す。
//　javascriptとスタイルシートを外だしするために、HtmlService.createTemplateFromFile()を使用する。
//　- registerSSByFormData():入力フォームデータを受け取って、スプレッドシートを更新する。
//　getSelectListFromMasterSS():スプレッドシートを参照し、入力フォームのセレクトボックスを動的に作成する。

/*◆◆◆アップロードファイルを格納するフォルダのID*/
var FOLDER_ID = '1RLnmxeTvkx5-tkye9pj2619Kog8TX4HG';/*　https://drive.google.com/drive/folders/1RLnmxeTvkx5-tkye9pj2619Kog8TX4HG　*/
/*◆◆◆スプレッドシート（リスト）のID*/
var ouboSS = '1NLV0lKIKM2i4Zny4wSNIKvJRUaN4RPyF829pwHcBETg';/*　https://docs.google.com/spreadsheets/d/1NLV0lKIKM2i4Zny4wSNIKvJRUaN4RPyF829pwHcBETg/edit#gid=0　*/

function doGet(e) {
  Logger.log( Utilities.jsonStringify(e) );

  //応募者リストssのIDとシート名設定
  var datasheet = SpreadsheetApp.openById(ouboSS).getSheetByName('Setting');
  var list = datasheet.getDataRange().getValues();//受け取ったシートのデータを二次元配列に取得
  var flg=list[3][3];//D4（募集中,終了）
  /*TEST*/ //flg='終了'
  var openimg=list[20][3];//D21（公募時画像ID）
  var docurl=list[27][3];//D28（第4回ビジネスプランdocx）
  var closeimg=list[36][3];//D37（終了時画像ID）
  var msg = list[41][3];//D42（終了時文言）
  
  if(flg=='募集中'){
    /*▽▽▽OPEN時▽▽▽*/
    if (!e.parameter.page) {
      var tpl = HtmlService.createTemplateFromFile('index');
      tpl.openimg=openimg;
      
      return tpl.evaluate().setTitle('Osaka SDGs Business Meet-Up 応募フォーム');
      
    }else{// if(e.parameter['page'] == "complete"){
      var tpl = HtmlService.createTemplateFromFile(e.parameter['page']);
      //パラメーター格納
      Logger.log('param:',e.parameter['recv']);
      tpl.recv = e.parameter['recv'];
      tpl.openimg=openimg;
      tpl.docurl=docurl;
      
      return tpl.evaluate().setTitle('Osaka SDGs Business Meet-Up 応募フォーム');      
      
    };
    var tpl = HtmlService.createTemplateFromFile(e.parameter['page']);
    tpl.openimg=openimg;
    return tpl.evaluate().setTitle('Osaka SDGs Business Meet-Up 応募フォーム');
    
    /*△△△OPEN時△△△*/
    
  }else{
    /*▽▽▽close時▽▽▽*/
    var tpl = HtmlService.createTemplateFromFile('index_close');
    tpl.msg=msg;
    tpl.closeimg=closeimg;
    
    return tpl.evaluate().setTitle('Osaka SDGs Business Meet-Up 応募フォーム');
    /*△△△close時△△△*/
  };

}

function getScriptUrl() {
  var url = ScriptApp.getService().getUrl();
  Logger.log('url=%s',url);
  return url;
};

function create_folder_gs(oubo_name) {
  //var oubo_name='テスト'  //var destfolderid = "1n-XBgi42HbCqh_CUw5lJAbZSWMdGMQUs";
  //保存先フォルダオブジェクトの取得
  var destfolder = DriveApp.getFolderById(FOLDER_ID);
  //保存先フォルダdestfolderにoubo_nameの名前の子フォルダを作る
  var foldername = oubo_name;
  var newfolder = destfolder.createFolder(foldername);
  var newfld_ID = newfolder.getId();
  Logger.log('folderID',newfld_ID);
  return newfld_ID;
};

function upload_file_gs(reader_result, file_name, fld_ID) {
  //添付ファイルをフォルダにアップロード
  var result_split = reader_result.split(',');
  var content_type = result_split[0].split(';')[0].replace('data:', '');
  var row_data = result_split[1];
  var data = Utilities.base64Decode(row_data);
  
  var file = Utilities.newBlob(data, content_type, file_name);
  var folder = DriveApp.getFolderById(fld_ID);
  var drive_file = folder.createFile(file);
  var file_url = drive_file.getUrl();
  return file_url;
};

/*TEST*/
//  var data=([0,"一般","16a23f152021bb",'dummy',"TEST8","ハチ","","はち","ハチ","330-6027","埼玉県","さいたま市中央区","新都心明治安田生命さいたま新都心ビル２７階","","","","はっち","ハッチ","03-987654321","a@ab.com","雇用予定","外部","","321654","はん用機械器具製造業","2008/5/22",'dummy','4',"654987","中央アフリカ","イエメン","TESt","","456789","","","","","","","","8.10","","","","","","","","","","TEST","X","","X","","","3",'dummy',"","","1UPOS6ssFUPYi3AIyvgYQYak5WCxj_8Sd"]);
function registerSSByFormData(data) {
//SSへデータ書き込み
  Logger.log("data = %s", data[1]);
  
  //応募者リストssのIDとシート名設定
  var datasheet = SpreadsheetApp.openById(ouboSS).getSheetByName('List');
  var list = datasheet.getDataRange().getValues();//受け取ったシートのデータを二次元配列に取得
  var lastRow = datasheet.getLastRow();
  
  var now = new Date();
  
  var ary=[];
  //var ListNo = '=row()-4';
  var data2 = Utilities.formatDate(now, 'JST', 'yyyy/MM/dd HH:mm:ss');//提出日
  var data25 ='https://drive.google.com/drive/folders/' + data[25]
  
  if(data[0]==0){
  //新規の時
    var ListNo = lastRow-3;
                    // 行番号,受付No.,提出日,提案者名称,提案者カナ,代表者役職,代表者氏名,代表者カナ,〒,都道府県,市区郡,町域,番地以降,連絡先部署名,連絡先役職,連絡先氏名,連絡先カナ,TEL,E-mail,SDGs目標,貢献内容,応募理由,相談内容,応募同意,フォルダID
    datasheet.appendRow([ListNo,data[1],data2,data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11],data[12],data[13],data[14],data[15],data[16],data[17],data[18],data[19],data[20],data[21],data[22],data[23],data[24],data25]);
    
  }else{
  //既存修正の時
    for(var i = 1; i < list.length; i++) {
      if(list[i][1]===data[1]){
        var ListNo = i-3;
        var r = i + 1;
      };
    };
          // 受付No.,提出日,提案者名称,提案者カナ,代表者役職,代表者氏名,代表者カナ,〒,都道府県,市区郡,町域,番地以降,連絡先部署名,連絡先役職,連絡先氏名,連絡先カナ,TEL,E-mail,SDGs目標,貢献内容,応募理由,相談内容,応募同意,フォルダID
    ary.push([data[1],data2,data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11],data[12],data[13],data[14],data[15],data[16],data[17],data[18],data[19],data[20],data[21],data[22],data[23],data[24],data25]);
    datasheet.getRange(r,2,1,25).setValues(ary);
  };
  
  var folder = DriveApp.getFolderById(data[25]);
  var folderName =　folder.getName();
  var indx = ('000' + (ListNo)).substr(-3);
  if(folderName.substr(0,3)!=indx){
    folder.setName(indx + '_' + folderName)
  };
  
  result = true;

  return {data: result};
};

function getList() {
  //応募者リストssのIDとシート名設定
  //var ouboSS = '1O7aF_lMYqZ_zAuQo96AHsgyhhQmk-48t6ThV72GbtU8'//スプレッドシートのID
//データ取得→表示
  var tablesheet = SpreadsheetApp.openById(ouboSS).getSheetByName('List');
  var list = tablesheet.getDataRange().getValues();//受け取ったシートのデータを二次元配列に取得
  Logger.log("read",list);
  return JSON.stringify(list);//listdata;
};

function upFileList(fld_ID) {
  Logger.log('fld_ID:%s',fld_ID);
  var fld = fld_ID.replace('https://drive.google.com/drive/folders/','');
  var folder = DriveApp.getFolderById(fld); 
  var files = folder.getFiles() //ファイル一覧
  var i = 0; //ファイルを格納する行位置
  var filelist = [];
  while(files.hasNext()){
    //変数にファイル名称とIdを出力
    i++
    var file = files.next();
    Logger.log('file:',file.getName(),file.getId());
    filelist[i]=[file.getName(),file.getId()];
  };
  return JSON.stringify(filelist);
};

function trashedFile(file_ID){
  var files = DriveApp.getFileById(file_ID)
  files.setTrashed(true) //ごみ箱へ
};

/*test data*/
//  var eml = 'shibata.ayaka@icnet.co.jp'; var recv = '16a539b33d334a';//'https://script.google.com/a/icnet.co.jp/macros/s/AKfycbwdXvymmGdioT9C4l0oEbeDKorvdmiNXVByRE8h2Zk/dev?page=complete&recv=16a2544de19270';//'16a2544de19270';
function sendHtmlMail(eml,recv){
//【js_complete:function tableHyouji(recv)も要編集 ※二次元配列の変数が異なるため全コピペNG】
//データ取得→表示
  var tablesheet = SpreadsheetApp.openById(ouboSS).getSheetByName('List');
  var list = tablesheet.getDataRange().getValues();//受け取ったシートのデータを二次元配列に取得
  var url = getScriptUrl();//'https://script.google.com/a/icnet.co.jp/macros/s/AKfycbwdXvymmGdioT9C4l0oEbeDKorvdmiNXVByRE8h2Zk/dev';//
  //?パラメータ名=値
  var recv_id= '&recv=' + recv;
  url += '?page=input' + recv_id; Logger.log("EditURL:", url);
  var tbl = '<table class="table table-striped"><thead style="background-color:#bbc8e6;"><tr><th style="width:30em;">項目</th><th style="width:60em;"></th><th style="width:160em;">入力内容</th></tr></thead><tbody style="background-color:##ffffff;"><tr>'
  for(var i=0; i<list.length; ++i ){//データの行ループ
    if(list[i][1]==recv){
      //宛名
      if(list[i][13]==''){
        var oubo=list[i][3] + '<br>' + list[i][14] + ' ' + list[i][15];
      }else{
        var oubo=list[i][3] + '<br> ' + list[i][13] + '<br> ' + list[i][14] + ' ' + list[i][15];
      };
      var fld_ID=list[i][25].replace('https://drive.google.com/drive/folders/','');
      
      for(var j=3; j<=24; ++j ) {//データの列ループ＊提案者名から表示　【function sendHtmlMail(eml,recv)も要編集 ※※二次元配列の変数が異なるため全コピペNG】
        if(j==23){//相談
          var str = list[i][j];
          str=(str.substr(1)).replace(/【/g,'<br>【');
          tbl += '<tr><td>' + list[2][j] + '</td>';//タイトル行3行目＊データは0start
          tbl += '<td>' + list[3][j] + '</td>';//タイトル行3行目＊データは0start
          tbl += '<td>' + '【' + str + '</td></tr>';
        }else if(list[i][j]!==''){
          tbl += '<tr><td>' + list[2][j] + '</td>';//タイトル行3行目＊データは0start
          tbl += '<td>' + list[3][j] + '</td>';//タイトル行3行目＊データは0start
          tbl += '<td>' + list[i][j] + '</td></tr>';
        };
      };break;
    };
  };
  tbl += '</tbody></table>';
  /*＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊*/
  var fld_result = upFileList(fld_ID);
  var tbl2 = '<table class="table table-striped"><thead style="background-color:#bbc8e6;"><tr><th>応募書類</th><th></th><th>アップロードファイル</th></tr></thead><tbody><tr>'
  var fld_data = JSON.parse(fld_result);
  //console.log("parse:", fld_data);
  tbl2 += '<td>' + 'ファイル名' + '</td>';//
  tbl2 += '<td colspan="2">';//
  for(var r=1; r<fld_data.length; ++r ){//データの行ループ
    tbl2 += fld_data[r][0] + '<br>';
  };
  tbl2 += '</td></tr>';
  tbl2 += '</tbody></table>';
  /*＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊*/

  /* ドキュメント「メール本文テスト」を取得する */
  var docID = '1HH6jgPz-g9sscHRw0ldcjVNIJ21-rDF2qw-2kngRlpI';// https://docs.google.com/document/d/1HH6jgPz-g9sscHRw0ldcjVNIJ21-rDF2qw-2kngRlpI/edit
  var docTest=DocumentApp.openById(docID); /*ドキュメントをIDで取得*/
  var subject = docTest.getName();//.replace(/●/g,tbl[i][1]);/*「●」を「第X回」に置換*/
  var strDoc= getContent(docID, true);//exportAsHTML(docID);//docTest.getBody().getText(); //ドキュメントの内容を取得
    strDoc = strDoc.replace(/&#9679;/g,oubo);/*「●」を「社名　担当者名」に置換*/
    strDoc = strDoc.replace('&#9670;',recv);/*「◆」を「受け付け番号」に置換*/
    strDoc = strDoc.replace('&#9632;','<a style="color:blue; text-decoration: underline; font-weight:bold;" href=' + url + '>' + url + '</a>');/*「■」を「URL」に置換*/
    strDoc = strDoc.replace('&#9660;',tbl);/*「▼」を応募情報変数「tbl」に置換*/
    strDoc = strDoc.replace('&#9650;',tbl2);/*「▲」を応募情報変数「tbl2」に置換*/
    //ファイルIDを指定して、ファイルを取得する//var report = DriveApp.getFileById(tbl[i][7]);//ファイルIDを入力
  
  if(eml.indexOf(',')!==-1){
    var mailto = eml.substr(0,eml.indexOf(','));//E-mail
    var mailcc = eml.substr(eml.indexOf(',')+1);
  }else{
    var mailto = eml; var mailcc = '';
  }
  var mailfrom = 'Osaka_SDGsBusiness@icnet.co.jp';//'shibata.ayaka@icnet.co.jp';//
  var strSender = '大阪SDGsビジネスミートアップ事務局';
  var replyto = 'Osaka_SDGsBusiness@icnet.co.jp';
  var subject = '【大阪SDGs Business Meet-Up】ご応募ありがとうございます！';
  
  GmailApp.sendEmail(
    mailto,//宛先
    subject,//件名
    '',//本文
    {
      from: mailfrom,  //送り元メールアドレス
      name: strSender, //差出人名
      htmlBody: strDoc,//mailOpt, //strDoc,  //html本文
      cc: mailcc,
      replyTo: replyto,
    }
  );/*MailApp.sendEmail(mailto, subject, message);//テキスト形式*/
}

//◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
/** * Takes in a Google Doc ID, gets that doc in HTML format, cleans up the markup, and returns the resulting HTML string. * * 
@param {string} the id of the google doc * 
@param {boolean} [useCaching] enable or disable caching. default true. * 
@return {string} the doc's body in html format */ 
function getContent(id, useCaching) {
  if (!id) {
    throw "Please call this API with a valid Google Doc ID"; 
  } 
  if (useCaching == null) {
    useCaching = true; 
  }
  if (typeof useCaching != "boolean") {
    throw "If you're going to specify useCaching, it must be boolean."; 
  }
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id); // see if we have a cached version of our parsed html if (cached && useCaching) { var html = cached; Logger.log("Pulling doc html from cache..."); } else { Logger.log("Grabbing and parsing fresh html from the doc...");
  try {
    var doc = DriveApp.getFileById(id); 
  } catch (err) {
    throw "Please call this API with a valid Google Doc ID. " + err.message; 
  } 
  var docName = doc.getName();
  var forDriveScope = DriveApp.getStorageUsed();
  // needed to get Drive Scope requested in ScriptApp.getOAuthToken();
  var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + id + "&exportFormat=html";
  var param = { method: "get", headers: {"Authorization": "Bearer " + ScriptApp.getOAuthToken()}, muteHttpExceptions:true, };
  var html = UrlFetchApp.fetch(url, param).getContentText();
  // nuke the whole head section, including the stylesheet and meta tag html = html.replace(/<head>.*<\/head>/, '');
  // remove almost all html attributes html = html.replace(/ (id|class|style|start|colspan|rowspan)="[^"]*"/g, '');
  // remove all of the spans, as well as the outer html and body html = html.replace(/<(span|\/span|body|\/body|html|\/html)>/g, '');
  // clearly the superior way of denoting line breaks html = html.replace(/<br>/g, '<br />'); cache.put(id, html, 900) // cache doc contents for 15 minutes, in case we get a lot of requests   }
  Logger.log(html);
  return html; 
}