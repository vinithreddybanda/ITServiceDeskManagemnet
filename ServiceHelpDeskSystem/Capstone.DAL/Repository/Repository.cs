using Capstone.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace Capstone.DAL.Repository;

public class Repository(HelpDeskDbContext context) : IRepository
{
    public bool Authenticate(User user)
    {
        return context.Users.Any(u => u.UserName == user.UserName && u.Password == user.Password);
    }

    public List<ServiceRequest> ViewRequests()
    {
        return context.ServiceRequests
            .Include(r => r.Status)
            .OrderByDescending(r => r.RequestId)
            .ToList();
    }

    public List<ServiceRequest> ViewRequests(string userName)
    {
        return context.ServiceRequests
            .Include(r => r.Status)
            .Where(r => r.RaisedBy == userName)
            .OrderByDescending(r => r.RequestId)
            .ToList();
    }

    public int RaiseRequest(ServiceRequest newRequest)
    {
        newRequest.RaisedOn = DateTime.Now;
        if (newRequest.ReqStatus == 0)
        {
            newRequest.ReqStatus = 1;
        }

        if (string.IsNullOrWhiteSpace(newRequest.Justification))
        {
            newRequest.Justification = "Initial request";
        }

        context.ServiceRequests.Add(newRequest);
        context.SaveChanges();
        return newRequest.RequestId;
    }

    public ServiceRequest GetRequestByld(int requestId)
    {
        return context.ServiceRequests
            .Include(r => r.Status)
            .FirstOrDefault(r => r.RequestId == requestId)!;
    }

    public bool ReOpenRequest(ServiceRequest request)
    {
        var existingRequest = context.ServiceRequests.FirstOrDefault(r => r.RequestId == request.RequestId);
        if (existingRequest == null)
        {
            return false;
        }

        existingRequest.ReqStatus = 1;
        existingRequest.Justification = request.Justification;
        context.SaveChanges();
        return true;
    }

    public List<ServiceRequest> GetRequestBySP(string userName)
    {
        return context.ServiceRequests
            .Include(r => r.Status)
            .Where(r => r.RaisedBy.Contains(userName))
            .OrderByDescending(r => r.RequestId)
            .ToList();
    }

    public bool CloseRequest(int requestId)
    {
        var request = context.ServiceRequests.FirstOrDefault(r => r.RequestId == requestId);
        if (request == null)
        {
            return false;
        }

        request.ReqStatus = 2;
        context.SaveChanges();
        return true;
    }

    public bool DeleteRequest(int requestId)
    {
        var request = context.ServiceRequests.FirstOrDefault(r => r.RequestId == requestId);
        if (request == null)
        {
            return false;
        }

        context.ServiceRequests.Remove(request);
        context.SaveChanges();
        return true;
    }

    public User GetUser(string userName)
    {
        return context.Users
            .Include(u => u.Role)
            .FirstOrDefault(u => u.UserName == userName)!;
    }
}