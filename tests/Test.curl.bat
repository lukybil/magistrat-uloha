@echo off

REM --------------------------------------------------
REM Monster Trading Cards Game
REM --------------------------------------------------
title Magistrat Uloha
echo CURL Testing for Magistrat Uloha
echo.

REM Buy ticket
echo Buying ticket
Set "BuyTicket=curl -X GET http://localhost:3000/buy --header "Content-Type: application/json" -d "{\"ticketType\":\"single\", \"venueId\" : \"b62c982d-bc83-44ef-a9ca-87978ba01d01\"}""
For /f %%R in ('%BuyTicket%') do ( Set ID=%%R )
Set ID=%ID:~13,-3%

echo Single ticket success: ticketId: %ID%
Set "BuyTicket=curl -X GET http://localhost:3000/buy --header "Content-Type: application/json" -d "{\"ticketType\":\"season\", \"venueId\" : \"b62c982d-bc83-44ef-a9ca-87978ba01d01\"}""
For /f %%R in ('%BuyTicket%') do ( Set ID2=%%R )
Set ID2=%ID2:~13,-3%

echo Season ticket success: ticketId: %ID2%
echo.
echo Making a reservation Single ticket
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID%\", \"date\" : \"2022-03-21\"}"
echo.
echo Making a reservation Season ticket
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID2%\", \"date\" : \"2022-03-21\"}"
echo.
echo Making a reservation Single ticket, should fail, if SNG has a limit of 2
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID%\", \"date\" : \"2022-03-21\"}"
echo.
echo Removing a reservation Single ticket
curl -X DELETE http://localhost:3000/reservation/remove --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID%\"}"
echo.
echo Making a reservation Single ticket, should fail, is single-use only
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID%\", \"date\" : \"2022-03-22\"}"
echo.
echo ====Now season ticket only
echo Removing a reservation
curl -X DELETE http://localhost:3000/reservation/remove --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID2%\"}"
echo.
echo Making a reservation again
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID2%\", \"date\" : \"2022-03-11\"}"
echo.
echo Rebooking a reservation
curl -X POST http://localhost:3000/reservation --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID2%\", \"date\" : \"2022-03-12\"}"
echo.
echo Removing a reservation
curl -X DELETE http://localhost:3000/reservation/remove --header "Content-Type: application/json" -d "{\"ticketId\":\"%ID2%\"}"
echo.

REM --------------------------------------------------
echo end...

REM this is approx a sleep 
ping localhost -n 100 >NUL 2>NUL
@echo on
