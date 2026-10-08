package com.batallagroup.klab;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "GoogleDriveBackup")
public class GoogleDriveBackupPlugin extends Plugin {
    private static final String TAG = "KlabDriveBackup";
    private static final String SCOPES = "oauth2:https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file";

    private GoogleSignInClient googleSignInClient;

    private GoogleSignInClient getClient() {
        if (googleSignInClient == null) {
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(
                    new Scope("https://www.googleapis.com/auth/drive.appdata"),
                    new Scope("https://www.googleapis.com/auth/drive.file")
                )
                .build();
            googleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
        }
        return googleSignInClient;
    }

    @PluginMethod
    public void getSignedInAccount(PluginCall call) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account != null && account.getEmail() != null) {
            JSObject ret = new JSObject();
            ret.put("signedIn", true);
            ret.put("email", account.getEmail());
            ret.put("displayName", account.getDisplayName() != null ? account.getDisplayName() : account.getEmail());
            call.resolve(ret);
        } else {
            JSObject ret = new JSObject();
            ret.put("signedIn", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        Intent signInIntent = getClient().getSignInIntent();
        startActivityForResult(call, signInIntent, "handleSignInResult");
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null) {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("email", account.getEmail());
                    ret.put("displayName", account.getDisplayName());
                    call.resolve(ret);
                    return;
                }
            } catch (Exception e) {
                Log.e(TAG, "Sign in exception", e);
                call.reject("Error al iniciar sesión con Google: " + e.getMessage());
                return;
            }
        }
        call.reject("Inicio de sesión cancelado");
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        getClient().signOut().addOnCompleteListener(getActivity(), task -> {
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void uploadBackup(PluginCall call) {
        String jsonContent = call.getString("jsonContent");
        if (jsonContent == null || jsonContent.isEmpty()) {
            call.reject("jsonContent es requerido");
            return;
        }

        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account == null || account.getAccount() == null) {
            call.reject("No hay sesión de Google activa. Por favor inicia sesión primero.");
            return;
        }

        // Ejecutar en hilo de fondo
        new Thread(() -> {
            try {
                String token = GoogleAuthUtil.getToken(getContext(), account.getAccount(), SCOPES);

                // 1. Buscar si ya existe el archivo en appDataFolder
                String fileId = findBackupFileId(token);

                // 2. Subir o actualizar archivo
                String uploadedId = uploadToDrive(token, jsonContent, fileId);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("fileId", uploadedId);
                ret.put("email", account.getEmail());
                ret.put("timestamp", System.currentTimeMillis());
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "Error subiendo respaldo a Google Drive", e);
                call.reject("Fallo al subir a Google Drive: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void downloadBackup(PluginCall call) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account == null || account.getAccount() == null) {
            call.reject("No hay sesión de Google activa.");
            return;
        }

        new Thread(() -> {
            try {
                String token = GoogleAuthUtil.getToken(getContext(), account.getAccount(), SCOPES);
                String fileId = findBackupFileId(token);

                if (fileId == null) {
                    call.reject("No se encontró ninguna copia de seguridad previa en tu Google Drive.");
                    return;
                }

                String jsonContent = downloadFromDrive(token, fileId);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("jsonContent", jsonContent);
                ret.put("email", account.getEmail());
                ret.put("timestamp", System.currentTimeMillis());
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "Error descargando respaldo de Google Drive", e);
                call.reject("Fallo al descargar de Google Drive: " + e.getMessage());
            }
        }).start();
    }

    private String findBackupFileId(String token) throws Exception {
        String queryUrl = "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='klab_backup_cloud.json'&fields=files(id,name,modifiedTime)";
        URL url = new URL(queryUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);

        if (conn.getResponseCode() == 200) {
            String response = readStream(conn.getInputStream());
            JSONObject json = new JSONObject(response);
            JSONArray files = json.optJSONArray("files");
            if (files != null && files.length() > 0) {
                return files.getJSONObject(0).getString("id");
            }
        }
        return null;
    }

    private String uploadToDrive(String token, String content, String existingFileId) throws Exception {
        String boundary = "-------314159265358979323846";
        String delimiter = "\r\n--" + boundary + "\r\n";
        String closeDelimiter = "\r\n--" + boundary + "--";

        JSONObject metadata = new JSONObject();
        metadata.put("name", "klab_backup_cloud.json");
        metadata.put("mimeType", "application/json");

        if (existingFileId == null) {
            JSONArray parents = new JSONArray();
            parents.put("appDataFolder");
            metadata.put("parents", parents);
        }

        String uploadUrl = existingFileId != null
            ? "https://www.googleapis.com/upload/drive/v3/files/" + existingFileId + "?uploadType=multipart"
            : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

        URL url = new URL(uploadUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(existingFileId != null ? "PATCH" : "POST");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setRequestProperty("Content-Type", "multipart/related; boundary=" + boundary);
        conn.setDoOutput(true);

        ByteArrayOutputStream body = new ByteArrayOutputStream();
        body.write(delimiter.getBytes(StandardCharsets.UTF_8));
        body.write("Content-Type: application/json; charset=UTF-8\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write(metadata.toString().getBytes(StandardCharsets.UTF_8));

        body.write(delimiter.getBytes(StandardCharsets.UTF_8));
        body.write("Content-Type: application/json\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write(content.getBytes(StandardCharsets.UTF_8));
        body.write(closeDelimiter.getBytes(StandardCharsets.UTF_8));

        try (OutputStream out = conn.getOutputStream()) {
            out.write(body.toByteArray());
        }

        if (conn.getResponseCode() >= 200 && conn.getResponseCode() < 300) {
            String resp = readStream(conn.getInputStream());
            JSONObject respJson = new JSONObject(resp);
            return respJson.optString("id", existingFileId);
        } else {
            String err = readStream(conn.getErrorStream());
            throw new RuntimeException("Drive API error (" + conn.getResponseCode() + "): " + err);
        }
    }

    private String downloadFromDrive(String token, String fileId) throws Exception {
        String downloadUrl = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media";
        URL url = new URL(downloadUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);

        if (conn.getResponseCode() == 200) {
            return readStream(conn.getInputStream());
        } else {
            String err = readStream(conn.getErrorStream());
            throw new RuntimeException("Drive download error (" + conn.getResponseCode() + "): " + err);
        }
    }

    private String readStream(InputStream is) throws Exception {
        if (is == null) return "";
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }
}
